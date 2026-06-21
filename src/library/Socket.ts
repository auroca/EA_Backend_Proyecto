import http from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/config';
import Logging from './Logging';
import { verifyAccessToken } from '../utils/jwt';
import Chat from '../models/Chat';
import ChatService from '../services/Chat';
import NotificationService from '../services/Notification';

// Socket event type definitions for extensibility
type ClientToServerEvents = Record<string, (...args: any[]) => void>;

// Server events that can be emitted to clients
type ServerToClientEvents = Record<string, (...args: any[]) => void>;

type InterServerEvents = Record<string, never>;

// Socket metadata stored per connected user
export type SocketData = {
    user_id: string;
    username: string;
    room: string;
};

// Global Socket.IO server instance
let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

/**
 * Extract JWT access token from socket handshake.
 * Tries both auth.accessToken and Authorization header (Bearer scheme).
 */
const getTokenFromSocket = (socket: Socket) => {
    const authToken = socket.handshake.auth?.accessToken;

    if (typeof authToken === 'string' && authToken.trim().length > 0) {
        return authToken;
    }

    const authorizationHeader = socket.handshake.headers.authorization;

    if (typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')) {
        return authorizationHeader.split(' ')[1];
    }

    return null;
};

/**
 * Generate private room identifier for a user.
 * Format: user:<userId>
 */
export const getPrivateRoomByUserId = (userId: string) => `user:${userId}`;

/**
 * Generate chat room identifier.
 * Format: chat:<chatId>
 */
export const getChatRoomByChatId = (chatId: string) => `chat:${chatId}`;

/**
 * Create initial socket session data for authenticated user.
 */
export const createSocketUserSession = (userId: string, username: string): SocketData => ({
    user_id: userId,
    username,
    room: getPrivateRoomByUserId(userId)
});

/**
 * Get all chat IDs where a user is a participant.
 * Queries MongoDB for all chats containing the user.
 */
const getUserChatRooms = async (userId: string): Promise<string[]> => {
    try {
        const chats = await Chat.find({ participants: userId }).select('_id').exec();
        return chats.map((chat) => String(chat._id));
    } catch (error) {
        Logging.error(`Error fetching user chat rooms - USER_ID: [${userId}] - ERROR: [${error}]`);
        return [];
    }
};

/**
 * Register core socket event handlers (disconnect, chat messages, etc.).
 * Handles incoming client events and broadcast logic.
 */
const registerConnectionEvents = (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    /**
     * Handle incoming message from user.
     * Saves to database and broadcasts to all participants in the chat room.
     */
    socket.on('chat:message', async (data: { chat_id: string; username: string; message: string }) => {
        try {
            const { chat_id: chatId, username, message } = data;

            // Validate username matches socket identity
            if (username !== socket.data.username) {
                Logging.error(`Username mismatch - SOCKET_USER: [${socket.data.username}] - SENT_USER: [${username}]`);
                return;
            }

            // Save message to database
            const result = await ChatService.addMessage(chatId, socket.data.user_id, message);

            if (!result.success) {
                Logging.error(`Error saving chat message - CHAT_ID: [${chatId}] - ERROR: [${result.error}]`);
                return;
            }

            const savedMessage = result.data.chatHistory[result.data.chatHistory.length - 1];

            // Broadcast message to all users in the chat room
            const chatRoom = getChatRoomByChatId(chatId);
            const socketServer = getSocketServer();
            socketServer.to(chatRoom).emit('chat:message', {
                chat_id: chatId,
                user_id: socket.data.user_id,
                username,
                message,
                timestamp: savedMessage?.timestamp ?? new Date()
            });

            Logging.info(`Chat message - CHAT_ID: [${chatId}] - USERNAME: [${username}] - MESSAGE: [${message}]`);

            void NotificationService.notifyChatMessage(result.data, socket.data.user_id, message).catch((error) => {
                Logging.error('Error sending chat push notification', error);
            });
        } catch (error) {
            Logging.error(`Error handling chat message - ERROR: [${error}]`);
        }
    });

    socket.on('disconnect', async (reason) => {
        Logging.info(`Socket disconnected - USER_ID: [${socket.data.user_id}] - REASON: [${reason}]`);

        // Notify all chat rooms that user left
        const chatRooms = await getUserChatRooms(socket.data.user_id);
        for (const chatId of chatRooms) {
            await broadcastChatParticipants(chatId);
        }
    });
};

/**
 * Initialize Socket.IO server on HTTP server instance.
 * Sets up CORS, JWT authentication middleware, and connection handler.
 * Idempotent: calling multiple times returns existing instance.
 */
export const initializeSocket = (server: http.Server) => {
    if (io) {
        return io;
    }

    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        cors: {
            origin: config.cors.origins,
            credentials: true
        }
    });

    // JWT authentication middleware: decode token and hydrate socket.data
    io.use((socket, next) => {
        const token = getTokenFromSocket(socket);

        if (!token) {
            return next(new Error('Access token required for socket.io'));
        }

        try {
            const decoded = verifyAccessToken(token);
            socket.data = createSocketUserSession(decoded.id, decoded.username);

            return next();
        } catch (error) {
            return next(new Error('Invalid access token for socket.io'));
        }
    });

    // Connection handler: join private user room and auto-join chat rooms
    io.on('connection', async (socket) => {
        socket.join(socket.data.room);

        Logging.info(`Socket connected - USER_ID: [${socket.data.user_id}] - USERNAME: [${socket.data.username}] - ROOM: [${socket.data.room}]`);

        // Auto-join user to all their chat rooms from database
        const chatRooms = await getUserChatRooms(socket.data.user_id);
        for (const chatId of chatRooms) {
            joinChatRoom(socket, chatId);
        }

        // Notify each room about the updated participants
        for (const chatId of chatRooms) {
            await broadcastChatParticipants(chatId);
        }

        registerConnectionEvents(socket);
    });

    return io;
};

/**
 * Get global Socket.IO server instance.
 * Throws error if socket hasn't been initialized.
 */
export const getSocketServer = () => {
    if (!io) {
        throw new Error('Socket.io server has not been initialized');
    }

    return io;
};

/**
 * Emit event to a user's private room.
 */
export function emitToUserRoom(userId: string, event: string, payload: unknown): void {
    const socketServer = getSocketServer();
    socketServer.to(getPrivateRoomByUserId(userId)).emit(event as any, payload as any);
}

/**
 * Join a socket to a chat room.
 */
export const joinChatRoom = (socket: Socket, chatId: string): void => {
    const chatRoom = getChatRoomByChatId(chatId);
    socket.join(chatRoom);
    Logging.info(`Socket joined chat room - USER_ID: [${socket.data.user_id}] - CHAT_ROOM: [${chatRoom}]`);
};

/**
 * Remove a socket from a chat room.
 */
export const leaveChatRoom = (socket: Socket, chatId: string): void => {
    const chatRoom = getChatRoomByChatId(chatId);
    socket.leave(chatRoom);
    Logging.info(`Socket left chat room - USER_ID: [${socket.data.user_id}] - CHAT_ROOM: [${chatRoom}]`);
};

/**
 * Get list of usernames for all sockets in a specific chat room.
 * Asynchronously fetches all connected sockets and filters by room membership.
 */
export const getChatRoomParticipants = async (chatId: string): Promise<string[]> => {
    try {
        const socketServer = getSocketServer();
        const chatRoom = getChatRoomByChatId(chatId);

        // Fetch all connected sockets and filter by room
        const sockets = await socketServer.in(chatRoom).fetchSockets();
        const usernames = sockets.map((socket) => socket.data.username).filter(Boolean);

        return usernames;
    } catch (error) {
        Logging.error(`Error fetching chat room participants - CHAT_ID: [${chatId}] - ERROR: [${error}]`);
        return [];
    }
};

/**
 * Broadcast updated participant list to all users in a chat room.
 * Emits current list of connected participants in the room.
 */
export const broadcastChatParticipants = async (chatId: string): Promise<void> => {
    try {
        const chatRoom = getChatRoomByChatId(chatId);
        const socketServer = getSocketServer();

        // Get updated participant list and broadcast it
        const participants = await getChatRoomParticipants(chatId);
        socketServer.to(chatRoom).emit('chat:participants', {
            chat_id: chatId,
            participants,
            count: participants.length,
            timestamp: new Date()
        });

        Logging.info(`Broadcast participants updated - CHAT_ID: [${chatId}] - PARTICIPANTS: [${participants.join(', ')}]`);
    } catch (error) {
        Logging.error(`Error broadcasting group participants - CHAT_ID: [${chatId}] - ERROR: [${error}]`);
    }
};

/**
 * Broadcast reload signal to connected users to refresh their chat list.
 * Optionally excludes a specific user (useful when they just created a chat).
 */
export const broadcastChatReload = (excludeUserId?: string): void => {
    try {
        const socketServer = getSocketServer();

        if (excludeUserId) {
            // Emit to all users EXCEPT the specified user by using the private room exclusion
            const excludeRoom = getPrivateRoomByUserId(excludeUserId);
            socketServer.except(excludeRoom).emit('chat:reload', { timestamp: new Date() });
            Logging.info(`Broadcast chat:reload (excluding user: ${excludeUserId})`);
        } else {
            // Emit to all connected users
            socketServer.emit('chat:reload', { timestamp: new Date() });
            Logging.info('Broadcast chat:reload to all connected users');
        }
    } catch (error) {
        Logging.error(`Error broadcasting chat reload - ERROR: [${error}]`);
    }
};

/**
 * Join all active sockets for a user into a specific chat room.
 * Useful right after HTTP join to avoid requiring reconnection.
 */
export const joinUserToChatRoom = async (userId: string, chatId: string): Promise<void> => {
    try {
        const socketServer = getSocketServer();
        const privateRoom = getPrivateRoomByUserId(userId);
        const chatRoom = getChatRoomByChatId(chatId);
        const sockets = await socketServer.in(privateRoom).fetchSockets();

        for (const socket of sockets) {
            socket.join(chatRoom);
            Logging.info(`Socket joined chat room - USER_ID: [${socket.data.user_id}] - CHAT_ROOM: [${chatRoom}]`);
        }
    } catch (error) {
        Logging.error(`Error joining user sockets to chat room - USER_ID: [${userId}] - CHAT_ID: [${chatId}] - ERROR: [${error}]`);
    }
};
