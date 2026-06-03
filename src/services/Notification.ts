import { fcm } from '../config/firebase';
import Logging from '../library/Logging';
import UserService from './User';

type NotificationData = Record<string, string | number | boolean | null | undefined>;

const normalizeData = (data: NotificationData) => {
    return Object.fromEntries(
        Object.entries(data)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => [key, String(value)])
    );
};

const chunk = <T>(items: T[], size: number): T[][] => {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
};

const shorten = (text: string, maxLength = 90) => {
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
};

const sendPushToUsers = async (userIds: string[], title: string, body: string, data: NotificationData) => {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

    Logging.info('Push notification recipients resolved', {
        userCount: uniqueUserIds.length,
        title,
        data: normalizeData(data)
    });

    if (uniqueUserIds.length === 0) {
        return {
            successCount: 0,
            failureCount: 0
        };
    }

    const tokens = await UserService.getFcmTokensByUserIds(uniqueUserIds);
    const uniqueTokens = [...new Set(tokens.filter(Boolean))];

    Logging.info('Push notification tokens resolved', {
        userCount: uniqueUserIds.length,
        tokenCount: uniqueTokens.length,
        title
    });

    if (uniqueTokens.length === 0) {
        return {
            successCount: 0,
            failureCount: 0
        };
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    for (const tokenGroup of chunk(uniqueTokens, 500)) {
        const response = await fcm.sendEachForMulticast({
            tokens: tokenGroup,
            notification: {
                title,
                body
            },
            data: normalizeData(data),
            android: {
                priority: 'high'
            }
        });

        successCount += response.successCount;
        failureCount += response.failureCount;

        Logging.info('Firebase multicast response received', {
            successCount: response.successCount,
            failureCount: response.failureCount,
            title
        });

        response.responses.forEach((item, index) => {
            if (!item.success) {
                Logging.warning('Firebase push token send failed', {
                    code: item.error?.code,
                    message: item.error?.message,
                    tokenPrefix: tokenGroup[index]?.slice(0, 12)
                });
            }

            if (!item.success && item.error?.code === 'messaging/registration-token-not-registered') {
                invalidTokens.push(tokenGroup[index]);
            }
        });
    }

    if (invalidTokens.length > 0) {
        await UserService.removeFcmTokens(invalidTokens);
    }

    return {
        successCount,
        failureCount
    };
};

const notifyChatMessage = async (chat: any, senderId: string, message: string) => {
    const recipientIds = (chat.participants ?? []).map((participant: any) => String(participant._id ?? participant)).filter((participantId: string) => participantId !== String(senderId));

    Logging.info('Chat message notification requested', {
        chatId: String(chat._id),
        senderId: String(senderId),
        recipientCount: recipientIds.length
    });

    return sendPushToUsers(recipientIds, 'New chat message', shorten(message), {
        type: 'chat',
        chatId: String(chat._id),
        senderId: String(senderId)
    });
};

const notifyFavoriteRouteUpdated = async (routeId: string, routeName?: string) => {
    const userIds = await UserService.getUserIdsByFavoriteRoute(routeId);

    Logging.info('Favorite route update notification requested', {
        routeId,
        routeName,
        favoriteUserCount: userIds.length
    });

    return sendPushToUsers(userIds, 'Favorite route updated', routeName ? `The route "${routeName}" has changed.` : 'One of your favorite routes has changed.', {
        type: 'route',
        routeId: String(routeId)
    });
};

export default {
    sendPushToUsers,
    notifyChatMessage,
    notifyFavoriteRouteUpdated
};
