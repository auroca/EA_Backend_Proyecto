import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import ChatService from '../services/Chat';
import { parsePagination } from '../library/Pagination';
import Filters, { FieldSpec } from '../library/Filters';
import { AuthRequest } from '../middleware/auth';
import { broadcastChatParticipants, joinUserToChatRoom, broadcastChatReload } from '../library/Socket';

const createChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const payload = {
            name: req.body.name,
            participants: [new mongoose.Types.ObjectId(req.user.id)], // Add the current user as a participant
            password: req.body.password || null
        };

        const savedChat = await ChatService.createChat(payload);
        
        // Broadcast updated participants to chat room
        if (savedChat.participants && Array.isArray(savedChat.participants)) {
            await broadcastChatParticipants(String(savedChat._id));
        }
        
        // Notify other connected users (except the creator) to reload their chat list
        broadcastChatReload(req.user.id);
        
        return res.status(201).json(savedChat);
    } catch (error: any) {
        // Handle duplicate chat name error
        if (error.message && error.message.includes('already exists')) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ error });
    }
};

const readChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;

    if (!chatId) {
        return res.status(400).json({ message: 'chatId is required' });
    }

    try {
        const chat = await ChatService.getChat(chatId);

        return chat ? res.status(200).json(chat) : res.status(404).json({ message: 'Chat not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const readAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const pagination = parsePagination(req.query);

        const allowedFields: FieldSpec[] = [{ name: 'name', type: 'string' }];

        const sourceFilter = (req.query.filter as any) || {};
        const { filter, errors } = Filters.parseFilters(sourceFilter, allowedFields);

        if (errors.length) {
            return res.status(400).json({ errors });
        }

        const chats = await ChatService.getAllChatsSummary(pagination, filter);

        return res.status(200).json(chats);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const updateChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;

    if (!chatId) {
        return res.status(400).json({ message: 'chatId is required' });
    }

    try {
        const updatedChat = await ChatService.updateChat(chatId, req.body);

        return updatedChat ? res.status(200).json(updatedChat) : res.status(404).json({ message: 'Chat not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const deleteChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;

    if (!chatId) {
        return res.status(400).json({ message: 'chatId is required' });
    }

    try {
        const deleted = await ChatService.deleteChat(chatId);

        return deleted ? res.status(200).json({ message: 'Chat deleted' }) : res.status(404).json({ message: 'Chat not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const addMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;
    const userId = req.user?.id;
    const message = req.body.message;

    if (!chatId || !userId || !message) {
        return res.status(400).json({ message: 'chatId and message are required' });
    }

    try {
        const updatedChat = await ChatService.addMessage(chatId, userId, message);

        return updatedChat ? res.status(200).json(updatedChat) : res.status(404).json({ message: 'Chat not found' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const getChatsByUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        const pagination = parsePagination(req.query);
        const chats = await ChatService.getChatsByUser(userId, pagination);

        return res.status(200).json(chats);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

const joinChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;
    const userId = req.user?.id;
    const username = req.user?.username;
    const password = req.body.password;

    if (!chatId || !userId || password === undefined) {
        return res.status(400).json({ message: 'chatId and password are required' });
    }

    try {
        const joinedChat = await ChatService.joinChat(chatId, userId, password);

        if (!joinedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (joinedChat === 'INVALID_PASSWORD') {
            return res.status(401).json({ message: 'Invalid password' });
        }

        await joinUserToChatRoom(userId, chatId);

        // Notify other users in chat room with updated participants
        try {
            await broadcastChatParticipants(chatId);
        } catch (socketError) {
            // If socket fails, still return the joined chat data (socket is optional)
            console.error('Socket error on chat join:', socketError);
        }

        return res.status(200).json(joinedChat);
    } catch (error) {
        return res.status(500).json({ error });
    }
};

export default {
    createChat,
    readChat,
    readAll,
    updateChat,
    deleteChat,
    addMessage,
    getChatsByUser,
    joinChat
};
