import mongoose from 'mongoose';
import User, { IUserModel, IUser } from '../models/User';

const createUser = async (data: Partial<IUser>): Promise<IUserModel> => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        ...data
    });
    return await user.save();
};

const getUser = async (userId: string): Promise<IUserModel | null> => {
    return await User.findById(userId);
};

const getAllUsers = async (): Promise<IUserModel[]> => {
    return await User.find();
};

const updateUser = async (userId: string, data: Partial<IUser>): Promise<IUserModel | null> => {
    const user = await User.findById(userId);
    if (user) {
        user.set(data);
        return await user.save();
    }
    return null;
};

const deleteUser = async (userId: string): Promise<IUserModel | null> => {
    return await User.findByIdAndDelete(userId);
};

export default { createUser, getUser, getAllUsers, updateUser, deleteUser };