import mongoose from 'mongoose';

export interface User {
    _id?: mongoose.Types.ObjectId;
    email: string;
    password: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}
