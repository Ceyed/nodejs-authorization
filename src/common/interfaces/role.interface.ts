import mongoose from 'mongoose';
import { connectToMongo } from '../../modules/app/config/db';
import { RolesMongoCollectionNameConstant } from '../constants/mongo/roles-collection.constant';
import { PermissionsEnum } from '../enums/permissions.enum';
import { RolesEnum } from '../enums/roles.enum';

export interface RoleInterface {
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    name: string;
    permissions: PermissionsEnum[];
    groups: string[];
}

export interface UserWithRoleInterface {
    sub: string;
    role: RolesEnum;
}

export const getRoleCollection = async () => {
    const db = await connectToMongo();
    return db.collection<RoleInterface>(RolesMongoCollectionNameConstant);
};
