import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { getRoleCollection } from '../../common/models/role.model';
import { PermissionGroupService } from './group.service';

export class RbacService {
    static async roleExists(roleName: string): Promise<boolean> {
        const rolesCollection = await getRoleCollection();
        const role = await rolesCollection.findOne({ name: roleName });
        return !!role;
    }

    static async getPermissions(roleName: string): Promise<string[]> {
        const rolesCollection = await getRoleCollection();

        const role = await rolesCollection.findOne({ name: roleName });
        if (!role) {
            throw new Error(`Role "${roleName}" not found`);
        }

        let allPermissions = [...role.permissions];

        for (const group of role.groups) {
            const groupPermissions = await PermissionGroupService.getGroup(group);
            allPermissions = [...new Set([...allPermissions, ...groupPermissions])];
        }

        allPermissions = allPermissions.reduce((acc, permission) => {
            const [module, action] = permission.split(':');
            if (action === PermissionsEnum.ALL) {
                // TODO: No hardcode
                const modulePermissions = [`${module}:read`, `${module}:write`, `${module}:delete`];
                return [...acc, ...modulePermissions];
            }
            return [...acc, permission];
        }, [] as string[]);

        return [...new Set(allPermissions)];
    }

    static async hasPermission(
        roleName: string,
        module: ModulesEnum,
        action: PermissionsEnum,
    ): Promise<boolean> {
        const requiredPermission = `${module}:${action}`;
        const permissions = await this.getPermissions(roleName);
        return permissions.includes(requiredPermission);
    }

    static async addPermission(roleName: string, permission: string): Promise<void> {
        const rolesCollection = await getRoleCollection();

        const role = await rolesCollection.findOne({ name: roleName });
        if (!role) {
            throw new Error(`Role "${roleName}" not found`);
        }

        if (!role.permissions.includes(permission)) {
            await rolesCollection.updateOne(
                { name: roleName },
                { $push: { permissions: permission }, $set: { updatedAt: new Date() } },
            );
        }
    }

    static async removePermission(roleName: string, permission: string): Promise<void> {
        const rolesCollection = await getRoleCollection();

        await rolesCollection.updateOne(
            { name: roleName },
            { $pull: { permissions: permission }, $set: { updatedAt: new Date() } },
        );
    }
}
