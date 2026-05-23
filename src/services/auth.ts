import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { createSocketUserSession } from '../library/Socket';

export const validateUserCredentials = async (email: string, password: string) => {
    const user = await User.findOne({ email: email.toLowerCase() }).exec();

    if (!user) {
        return null;
    }

    if (!user.enabled) {
        return null;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return null;
    }

    return user;
};

export const getTokens = (user: any) => {
    const accessToken = generateAccessToken(String(user._id), user.username, user.email, user.role);

    const refreshToken = generateRefreshToken(String(user._id), user.username, user.email, user.role);

    return { accessToken, refreshToken };
};

export const getLoginPayload = (user: any) => {
    const { accessToken, refreshToken } = getTokens(user);
    const socket = createSocketUserSession(String(user._id), user.username);

    return {
        accessToken,
        refreshToken,
        socket
    };
};

export const refreshUserSession = async (incomingRefreshToken: string) => {
    const payload = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(payload.id).exec();

    if (!user || !user.enabled) {
        throw new Error('User not found');
    }

    const tokens = getTokens(user);
    return tokens;
};
