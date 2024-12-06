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
}
