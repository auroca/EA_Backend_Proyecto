import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import ChatService from '../services/Chat';
import NotificationService from '../services/Notification';
import { parsePagination } from '../library/Pagination';
import Filters, { FieldSpec } from '../library/Filters';
import { AuthRequest } from '../middleware/auth';
import { broadcastChatParticipants, joinUserToChatRoom, broadcastChatReload } from '../library/Socket';
import { isValidObjectId, sendServiceError } from '../utils/controllerResponses';

const createChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
    }

    const payload = {
        name: req.body.name,
        participants: [new mongoose.Types.ObjectId(req.user.id)],
        password: req.body.password || null
    };

    const result = await ChatService.createChat(payload);

    if (!result.success) {
        return sendServiceError(res, result.error, result.statusCode);
    }

    if (result.data.participants && Array.isArray(result.data.participants)) {
        await broadcastChatParticipants(String(result.data._id));
    }

    broadcastChatReload(req.user.id);

    return res.status(201).json(result.data);
};

const readChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;

    if (!isValidObjectId(chatId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await ChatService.getChat(chatId);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
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

        const result = await ChatService.getAllChatsSummary(pagination, filter);

        if (result.success) {
            return res.status(200).json(result.data);
        }

        return sendServiceError(res, result.error, result.statusCode);
    } catch {
        return sendServiceError(res, 'Unexpected server error');
    }
};

const updateChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;

    if (!isValidObjectId(chatId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await ChatService.updateChat(chatId, req.body);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const deleteChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;

    if (!isValidObjectId(chatId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const result = await ChatService.deleteChat(chatId);

    if (result.success) {
        return res.status(200).json({ message: 'Chat deleted' });
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const addMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;
    const userId = req.user?.id;
    const message = req.body.message;

    if (!isValidObjectId(chatId) || !userId || !message) {
        return res.status(400).json({ status: 'error', message: 'chatId and message are required' });
    }
    const result = await ChatService.addMessage(chatId, userId, message);

    if (result.success) {
        void (async () => {
            try {
                await NotificationService.notifyChatMessage(result.data, userId, message);
            } catch {
                // Push notifications are best-effort; the chat message response should not fail.
            }
        })();

        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const getChatsByUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.params.userId ?? req.params.UserId;

    if (!isValidObjectId(userId)) {
        return res.status(400).json({ status: 'error', message: 'Provided ID has an invalid format' });
    }

    const pagination = parsePagination(req.query);
    const result = await ChatService.getChatsByUser(userId, pagination);

    if (result.success) {
        return res.status(200).json(result.data);
    }

    return sendServiceError(res, result.error, result.statusCode);
};

const joinChat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const chatId = req.params.chatId ?? req.params.ChatId;
    const userId = req.user?.id;
    const password = req.body.password;

    if (!isValidObjectId(chatId) || !userId || password === undefined) {
        return res.status(400).json({ status: 'error', message: 'chatId and password are required' });
    }

    const result = await ChatService.joinChat(chatId, userId, password);

    if (!result.success) {
        return sendServiceError(res, result.error, result.statusCode);
    }

    await joinUserToChatRoom(userId, chatId);

    try {
        await broadcastChatParticipants(chatId);
    } catch {
        // Socket updates are best-effort; HTTP join still succeeds.
    }

    return res.status(200).json(result.data);
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
