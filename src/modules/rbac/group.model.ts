import { connectToMongo } from '../../config/db';

export interface PermissionGroup {
    _id?: string;
    name: string;
    permissions: string[];
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const getPermissionGroupCollection = async () => {
    const db = await connectToMongo();
    return db.collection<PermissionGroup>('permission_groups');
};
