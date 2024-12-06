import mongoose from 'mongoose';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import {
    getPermissionGroupCollection,
    PermissionGroup,
} from '../../common/interfaces/permission-group.interface';
import { ModulePermissionType } from '../../common/types/module-permission.type';

export class PermissionGroupService {
    private static _instance: PermissionGroupService;

    private constructor() {}

    public static getInstance(): PermissionGroupService {
        if (!PermissionGroupService._instance) {
            PermissionGroupService._instance = new PermissionGroupService();
        }
        return PermissionGroupService._instance;
    }

    async createGroup(name: string, permissions: ModulePermissionType[]): Promise<void> {
        const groupCollection = await getPermissionGroupCollection();
        const existingGroup: PermissionGroup | null = await groupCollection.findOne({ name });
        if (existingGroup) {
            throw new Error(`Group "${name}" already exists`);
        }

        await groupCollection.insertOne({
            createdAt: new Date(),
            name,
            permissions,
        });
    }

    async getGroup(name: string): Promise<ModulePermissionType[]> {
        const groupCollection = await getPermissionGroupCollection();
        const group: PermissionGroup | null = await groupCollection.findOne({ name });
        if (!group) {
            throw new Error(`Group "${name}" not found`);
        }

        const expandedPermissions: ModulePermissionType[] = group.permissions.reduce(
            (acc, permission) => {
                const [module, action] = permission.split(':');
                if (action === 'all') {
                    const allPermissionExceptAll = Object.values(PermissionsEnum).filter(
                        (p) => p !== PermissionsEnum.ALL,
                    );
                    const modulePermissions: ModulePermissionType[] = allPermissionExceptAll.map(
                        (p) => `${module}:${p}` as ModulePermissionType,
                    );
                    return [...acc, ...modulePermissions];
                }
                return [...acc, permission] as ModulePermissionType[];
            },
            [] as ModulePermissionType[],
        );

        return [...new Set(expandedPermissions)];
    }

    async listGroups(): Promise<PermissionGroup[]> {
        const groupCollection = await getPermissionGroupCollection();
        return groupCollection.find().toArray();
    }

    async getGroupsByNames(names: string[]) {
        const groupCollection = await getPermissionGroupCollection();
        return groupCollection.find({ name: { $in: names } }).toArray();
    }

    async getPermissionById(permissionGroupId: string): Promise<{ name: string } | null> {
        const permissionGroupCollection = await getPermissionGroupCollection();
        const permission: PermissionGroup | null = await permissionGroupCollection.findOne({
            _id: new mongoose.Types.ObjectId(permissionGroupId) as any,
        });
        return permission ? { name: permission.name } : null;
    }

    async getGroupsByIds(groupIds: string[]): Promise<PermissionGroup[]> {
        const permissionGroupCollection = await getPermissionGroupCollection();

        return permissionGroupCollection
            .find({
                _id: { $in: groupIds.map((id) => new mongoose.Types.ObjectId(id)) as any },
            })
            .toArray();
    }
}
