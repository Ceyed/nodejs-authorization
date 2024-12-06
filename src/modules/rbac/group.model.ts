import { PermissionGroupMongoCollectionNameConstant } from '../../common/constants/mongo/permission-group-collection.constant';
import { ModulePermissionType } from '../../common/types/module-permission.type';
import { connectToMongo } from '../app/config/db';

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
