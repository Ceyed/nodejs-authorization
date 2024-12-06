import { ModulesEnum } from '../../enums/modules.enum';
import { PermissionsEnum } from '../../enums/permissions.enum';
import { getPermissionGroupCollection, PermissionGroup } from './group.model';

export class PermissionGroupService {
    static async createGroup(
        name: string,
        permissions: string[],
        description?: string,
    ): Promise<void> {
        const groupCollection = await getPermissionGroupCollection();

        const existingGroup = await groupCollection.findOne({ name });
        if (existingGroup) {
            throw new Error(`Group "${name}" already exists`);
        }

        await groupCollection.insertOne({
            name,
            permissions,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static async getGroup(name: string): Promise<string[]> {
        const groupCollection = await getPermissionGroupCollection();

        const group = await groupCollection.findOne({ name });
        if (!group) {
            throw new Error(`Group "${name}" not found`);
        }

        const expandedPermissions = group.permissions.reduce((acc, permission) => {
            const [module, action] = permission.split(':');
            if (action === 'all') {
                // TODO: No hardcode
                const modulePermissions = [`${module}:read`, `${module}:write`, `${module}:delete`];
                return [...acc, ...modulePermissions];
            }
            return [...acc, permission];
        }, [] as string[]);

        return [...new Set(expandedPermissions)];
    }

    static async listGroups(): Promise<PermissionGroup[]> {
        const groupCollection = await getPermissionGroupCollection();
        return groupCollection.find().toArray();
    }

    static async initializeDefaultGroups(): Promise<void> {
        await PermissionGroupService.createGroup('Blog Manager', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.ALL}`,
        ]);
        await PermissionGroupService.createGroup('Product Manager', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.READ}`,
        ]);
        await PermissionGroupService.createGroup('Role Manager', [
            `${ModulesEnum.ROLE}:${PermissionsEnum.ALL}`,
        ]);
        await PermissionGroupService.createGroup('User Group Manager', [
            `${ModulesEnum.USER_GROUP}:${PermissionsEnum.ALL}`,
        ]);
    }
}
