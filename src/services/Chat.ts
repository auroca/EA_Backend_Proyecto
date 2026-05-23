import mongoose from 'mongoose';
import Chat, { IChatModel, IChat } from '../models/Chat';
import { ServiceResult } from '../types/ServiceResult';

export type ChatSummary = {
    _id: string;
    name: string;
    hasPassword: boolean;
};

type PaginationLimit = 10 | 25 | 50;

type PaginationParams = {
    limit: PaginationLimit;
    page: number;
};

const chatNameExists = async (name: string): Promise<boolean> => {
    const existingChat = await Chat.findOne({ name: name.toLowerCase() }).exec();
    return !!existingChat;
};

const createChat = async (data: Partial<IChat>): Promise<ServiceResult<IChatModel>> => {
    try {
        if (data.name) {
            const exists = await chatNameExists(data.name);
            if (exists) {
                return { success: false, error: `Chat name "${data.name}" already exists`, statusCode: 409 };
            }
        }

        const chat = new Chat({
            _id: new mongoose.Types.ObjectId(),
            ...data
        });

        const savedChat = await chat.save();
        return { success: true, data: savedChat };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getChat = async (chatId: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const chat = await Chat.findById(chatId).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        return { success: true, data: chat };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getAllChats = async (pagination?: PaginationParams, filter?: Record<string, unknown>): Promise<ServiceResult<IChatModel[]>> => {
    try {
        const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

        if (!pagination) {
            const chats = await Chat.find(effectiveFilter).sort({ _id: 1 }).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();
            return { success: true, data: chats };
        }

        const { limit, page } = pagination;
        const skip = (page - 1) * limit;

        const chats = await Chat.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();
        return { success: true, data: chats };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getAllChatsSummary = async (pagination?: PaginationParams, filter?: Record<string, unknown>): Promise<ServiceResult<ChatSummary[]>> => {
    try {
        const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

        const query = Chat.find(effectiveFilter).sort({ _id: 1 }).select('_id name').select('+password').lean<{ _id: mongoose.Types.ObjectId; name: string; password?: string | null }[]>();

        if (pagination) {
            const { limit, page } = pagination;
            const skip = (page - 1) * limit;
            query.skip(skip).limit(limit);
        }

        const chats = await query.exec();

        return {
            success: true,
            data: chats.map((chat) => ({
                _id: String(chat._id),
                name: chat.name,
                hasPassword: typeof chat.password === 'string' && chat.password.length > 0
            }))
        };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const updateChat = async (chatId: string, data: Partial<IChat>): Promise<ServiceResult<IChatModel>> => {
    try {
        const chat = await Chat.findByIdAndUpdate(chatId, data, { new: true }).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        return { success: true, data: chat };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const deleteChat = async (chatId: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const chat = await Chat.findByIdAndDelete(chatId).exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        return { success: true, data: chat };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const addMessage = async (chatId: string, userId: string, message: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const chat = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: {
                    chatHistory: {
                        userId,
                        message,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        )
            .populate('participants', 'username name')
            .populate('chatHistory.userId', 'username name')
            .exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        return { success: true, data: chat };
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

const getChatsByUser = async (userId: string, pagination?: PaginationParams): Promise<ServiceResult<IChatModel[]>> => {
    const filter = { participants: userId };

    return await getAllChats(pagination, filter);
};

const joinChat = async (chatId: string, userId: string, password: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const chat = await Chat.findById(chatId).select('+password participants').exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        const alreadyParticipant = chat.participants.some((participantId) => participantId.toString() === userId);

        if (alreadyParticipant) {
            return await getChat(chatId);
        }

        if (chat.password && chat.password !== password) {
            return { success: false, error: 'Invalid password', statusCode: 401 };
        }

        chat.participants.push(new mongoose.Types.ObjectId(userId));
        await chat.save();

        return await getChat(chatId);
    } catch {
        return { success: false, error: 'Internal data server error', statusCode: 500 };
    }
};

export default {
    createChat,
    getChat,
    getAllChats,
    getAllChatsSummary,
    updateChat,
    deleteChat,
    addMessage,
    getChatsByUser,
    joinChat
};
