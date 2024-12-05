import mongoose from 'mongoose';
import { connectToMongo } from '../../config/db';

export interface Role {
    _id?: mongoose.Types.ObjectId;
    name: string;
    permissions: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export const getRoleCollection = async () => {
    const db = await connectToMongo();
    return db.collection<Role>('roles');
};
