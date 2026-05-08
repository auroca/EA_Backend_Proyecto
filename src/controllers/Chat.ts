import { NextFunction, Response } from 'express';
import ChatService from '../services/Chat';
import { parsePagination } from '../library/Pagination';
import Filters, { FieldSpec } from '../library/Filters';
import { AuthRequest } from '../middleware/auth';

const createChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const payload = {
            name: req.body.name,
            participants: req.body.participants,
            password: req.body.password || null
        };

        const savedChat = await ChatService.createChat(payload);
        return res.status(201).json(savedChat);
    } catch (error: any) {
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

        const chats = await ChatService.getAllChats(pagination, filter);

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

export default {
    createChat,
    readChat,
    readAll,
    updateChat,
    deleteChat,
    addMessage,
    getChatsByUser
};
