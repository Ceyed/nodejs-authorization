import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { getRoleCollection, RoleInterface } from '../../common/interfaces/role.interface';
import { ModulePermissionType } from '../../common/types/module-permission.type';
import { PermissionGroupService } from './group.service';

export class RbacService {
    static async roleExists(roleName: string): Promise<boolean> {
        const rolesCollection = await getRoleCollection();
        const role: RoleInterface | null = await rolesCollection.findOne({ name: roleName });
        return !!role;
    }

    static async getPermissions(roleName: string): Promise<ModulePermissionType[]> {
        const rolesCollection = await getRoleCollection();

        const role: RoleInterface | null = await rolesCollection.findOne({ name: roleName });
        if (!role) {
            throw new Error(`Role "${roleName}" not found`);
        }

        let allPermissions: string[] = [...role.permissions];

        for (const group of role.groups) {
            const groupPermissions = await PermissionGroupService.getGroup(group);
            allPermissions = [...new Set([...allPermissions, ...groupPermissions])];
        }

        allPermissions = allPermissions.reduce((acc, permission) => {
            const [module, action] = permission.split(':');
            if (action === PermissionsEnum.ALL) {
                const allPermissionExceptAll = Object.values(PermissionsEnum).filter(
                    (p) => p !== PermissionsEnum.ALL,
                );
                const modulePermissions: ModulePermissionType[] = allPermissionExceptAll.map(
                    (p) => `${module}:${p}` as ModulePermissionType,
                );
                return [...acc, ...modulePermissions];
            }
            return [...acc, permission];
        }, [] as string[]);

        return [...new Set(allPermissions)] as ModulePermissionType[];
    }

    static async hasPermission(
        roleName: string,
        module: ModulesEnum,
        action: PermissionsEnum,
    ): Promise<boolean> {
        const requiredPermission: ModulePermissionType = `${module}:${action}`;
        const permissions: ModulePermissionType[] = await this.getPermissions(roleName);
        return permissions.includes(requiredPermission);
    }

    static async addPermission(roleName: string, permission: PermissionsEnum): Promise<void> {
        const rolesCollection = await getRoleCollection();

        const role: RoleInterface | null = await rolesCollection.findOne({ name: roleName });
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

    static async removePermission(roleName: string, permission: PermissionsEnum): Promise<void> {
        const rolesCollection = await getRoleCollection();

        await rolesCollection.updateOne(
            { name: roleName },
            { $pull: { permissions: permission }, $set: { updatedAt: new Date() } },
        );
    }
}
