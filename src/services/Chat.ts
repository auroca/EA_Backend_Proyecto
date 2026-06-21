import mongoose from 'mongoose';
import Chat, { IChatModel, IChat } from '../models/Chat';
import { ServiceResult } from '../types/ServiceResult';

export type ChatSummary = {
    _id: string;
    name: string;
    hasPassword: boolean;
    unreadCount?: number;
};

type ChatSummaryDocument = {
    _id: mongoose.Types.ObjectId;
    name: string;
    participants?: mongoose.Types.ObjectId[];
    chatHistory?: {
        userId: mongoose.Types.ObjectId;
        timestamp: Date;
    }[];
    readStates?: {
        userId: mongoose.Types.ObjectId;
        lastReadAt: Date;
    }[];
    password?: string | null;
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
            ...data,
            readStates: data.participants?.map((participantId) => ({
                userId: participantId,
                lastReadAt: new Date()
            }))
        });

        const savedChat = await chat.save();
        return { success: true, data: savedChat };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const getUnreadCountForUser = (chat: ChatSummaryDocument, userId?: string): number | undefined => {
    if (!userId || !chat.participants?.some((participantId) => String(participantId) === userId)) {
        return undefined;
    }

    const readState = chat.readStates?.find((state) => String(state.userId) === userId);
    const lastReadAt = readState?.lastReadAt ? new Date(readState.lastReadAt) : new Date(0);

    return (chat.chatHistory ?? []).filter((entry) => {
        const sentByCurrentUser = String(entry.userId) === userId;
        const sentAfterLastRead = new Date(entry.timestamp).getTime() > lastReadAt.getTime();
        return !sentByCurrentUser && sentAfterLastRead;
    }).length;
};

const getChat = async (chatId: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const chat = await Chat.findById(chatId).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        return { success: true, data: chat };
    } catch {
        return { success: false, error: 'Internal data server error' };
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
        return { success: false, error: 'Internal data server error' };
    }
};

const getAllChatsSummary = async (pagination?: PaginationParams, filter?: Record<string, unknown>, currentUserId?: string): Promise<ServiceResult<ChatSummary[]>> => {
    try {
        const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

        const query = Chat.find(effectiveFilter).sort({ _id: 1 }).select('_id name participants chatHistory.userId chatHistory.timestamp readStates').select('+password').lean<ChatSummaryDocument[]>();

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
                hasPassword: typeof chat.password === 'string' && chat.password.length > 0,
                unreadCount: getUnreadCountForUser(chat, currentUserId)
            }))
        };
    } catch {
        return { success: false, error: 'Internal data server error' };
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
        return { success: false, error: 'Internal data server error' };
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
        return { success: false, error: 'Internal data server error' };
    }
};

const addMessage = async (chatId: string, userId: string, message: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const timestamp = new Date();
        const chat = await Chat.findById(chatId).exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        chat.chatHistory.push({
            userId: new mongoose.Types.ObjectId(userId),
            message,
            timestamp
        });

        const senderReadState = chat.readStates.find((state) => state.userId.toString() === userId);

        if (senderReadState) {
            senderReadState.lastReadAt = timestamp;
        } else {
            chat.readStates.push({
                userId: new mongoose.Types.ObjectId(userId),
                lastReadAt: timestamp
            });
        }

        await chat.save();

        const populatedChat = await Chat.findById(chatId).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();

        return { success: true, data: populatedChat ?? chat };
    } catch {
        return { success: false, error: 'Internal data server error' };
    }
};

const markChatRead = async (chatId: string, userId: string): Promise<ServiceResult<IChatModel>> => {
    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const now = new Date();
        const chat = await Chat.findById(chatId).exec();

        if (!chat) {
            return { success: false, error: `No chat found with ID: ${chatId}`, statusCode: 404 };
        }

        const isParticipant = chat.participants.some((participantId) => participantId.toString() === userId);

        if (!isParticipant) {
            return { success: false, error: 'User is not a participant of this chat', statusCode: 403 };
        }

        const readState = chat.readStates.find((state) => state.userId.toString() === userId);

        if (readState) {
            readState.lastReadAt = now;
        } else {
            chat.readStates.push({ userId: userObjectId, lastReadAt: now });
        }

        await chat.save();

        return await getChat(chatId);
    } catch {
        return { success: false, error: 'Internal data server error' };
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
            return { success: false, error: 'Invalid password', statusCode: 403 };
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        await Chat.updateOne(
            {
                _id: chat._id,
                participants: { $ne: userObjectId }
            },
            {
                $addToSet: { participants: userObjectId },
                $push: {
                    readStates: {
                        userId: userObjectId,
                        lastReadAt: new Date()
                    }
                }
            }
        ).exec();

        return await getChat(chatId);
    } catch {
        return { success: false, error: 'Internal data server error' };
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
    markChatRead,
    getChatsByUser,
    joinChat
};
