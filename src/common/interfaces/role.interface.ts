import mongoose from 'mongoose';
import { connectToMongo } from '../../modules/app/config/db';
import { RolesEnum } from '../enums/roles.enum';

export interface RoleInterface {
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    name: string;
    permissions: string[];
    groups: string[];
}

export interface UserWithRoleInterface {
    sub: string;
    role: RolesEnum;
}

export const getRoleCollection = async () => {
    const db = await connectToMongo();
    return db.collection<RoleInterface>('roles');
};
