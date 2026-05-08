import mongoose from 'mongoose';
import Chat, { IChatModel, IChat } from '../models/Chat';

type PaginationLimit = 10 | 25 | 50;

type PaginationParams = {
    limit: PaginationLimit;
    page: number;
};

const createChat = async (data: Partial<IChat>): Promise<IChatModel> => {
    const chat = new Chat({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });

    return await chat.save();
};

const getChat = async (chatId: string): Promise<IChatModel | null> => {
    return await Chat.findById(chatId).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();
};

const getAllChats = async (pagination?: PaginationParams, filter?: any): Promise<IChatModel[]> => {
    const effectiveFilter = filter && Object.keys(filter).length ? filter : {};

    if (!pagination) {
        return await Chat.find(effectiveFilter).sort({ _id: 1 }).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();
    }

    const { limit, page } = pagination;
    const skip = (page - 1) * limit;

    return await Chat.find(effectiveFilter).sort({ _id: 1 }).skip(skip).limit(limit).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();
};

const updateChat = async (chatId: string, data: Partial<IChat>): Promise<IChatModel | null> => {
    return await Chat.findByIdAndUpdate(chatId, data, { new: true }).populate('participants', 'username name').populate('chatHistory.userId', 'username name').exec();
};

const deleteChat = async (chatId: string): Promise<boolean> => {
    const result = await Chat.findByIdAndDelete(chatId).exec();
    return !!result;
};

const addMessage = async (chatId: string, userId: string, message: string): Promise<IChatModel | null> => {
    return await Chat.findByIdAndUpdate(
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
};

const getChatsByUser = async (userId: string, pagination?: PaginationParams): Promise<IChatModel[]> => {
    const filter = { participants: userId };

    return await getAllChats(pagination, filter);
};

const joinChat = async (chatId: string, userId: string, password: string): Promise<IChatModel | null | 'INVALID_PASSWORD'> => {
    const chat = await Chat.findById(chatId).select('+password participants').exec();

    if (!chat) {
        return null;
    }

    if (chat.password && chat.password !== password) {
        return 'INVALID_PASSWORD';
    }

    const alreadyParticipant = chat.participants.some((participantId) => participantId.toString() === userId);

    if (!alreadyParticipant) {
        chat.participants.push(new mongoose.Types.ObjectId(userId));
        await chat.save();
    }

    return await getChat(chatId);
};

export default {
    createChat,
    getChat,
    getAllChats,
    updateChat,
    deleteChat,
    addMessage,
    getChatsByUser,
    joinChat
};
