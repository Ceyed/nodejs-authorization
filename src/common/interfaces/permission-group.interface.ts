import { connectToMongo } from '../../modules/app/config/db';
import { PermissionGroupMongoCollectionNameConstant } from '../constants/mongo/permission-group-collection.constant';
import { ModulePermissionType } from '../types/module-permission.type';

export interface PermissionGroup {
    _id?: string;
    createdAt?: Date;
    name: string;
    permissions: ModulePermissionType[];
}

export const getPermissionGroupCollection = async () => {
    const db = await connectToMongo();
    return db.collection<PermissionGroup>(PermissionGroupMongoCollectionNameConstant);
};
