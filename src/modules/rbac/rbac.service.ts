import mongoose from 'mongoose';
import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { getRoleCollection, RoleInterface } from '../../common/interfaces/role.interface';
import { ModulePermissionType } from '../../common/types/module-permission.type';
import { PermissionGroupService } from './group.service';

export class RbacService {
    private static _instance: RbacService;
    private readonly _permissionGroupService: PermissionGroupService =
        PermissionGroupService.getInstance();

    private constructor() {}

    public static getInstance(): RbacService {
        if (!RbacService._instance) {
            RbacService._instance = new RbacService();
        }
        return RbacService._instance;
    }

    async roleExistsByName(roleName: string): Promise<boolean> {
        const rolesCollection = await getRoleCollection();
        const role: RoleInterface | null = await rolesCollection.findOne({ name: roleName });
        return !!role;
    }

    async findRole(roleId: string): Promise<RoleInterface | null> {
        const rolesCollection = await getRoleCollection();
        return rolesCollection.findOne({
            _id: new mongoose.Types.ObjectId(roleId),
        });
    }

    async getPermissions(roleName: string): Promise<ModulePermissionType[]> {
        const rolesCollection = await getRoleCollection();

        const role: RoleInterface | null = await rolesCollection.findOne({ name: roleName });
        if (!role) {
            throw new Error(`Role "${roleName}" not found`);
        }

        let allPermissions: string[] = [...role.permissions];

        for (const group of role.groups) {
            const groupPermissions = await this._permissionGroupService.getGroup(group);
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

    async hasPermission(
        roleName: string,
        module: ModulesEnum,
        action: PermissionsEnum,
    ): Promise<boolean> {
        const requiredPermission: ModulePermissionType = `${module}:${action}`;
        const permissions: ModulePermissionType[] = await this.getPermissions(roleName);
        return permissions.includes(requiredPermission);
    }

    async addGroupToRole(roleId: string, permissionGroupId: string): Promise<void> {
        const rolesCollection = await getRoleCollection();

        const role: RoleInterface | null = await rolesCollection.findOne({
            _id: new mongoose.Types.ObjectId(roleId),
        });
        if (!role) {
            throw new Error(`Role with ID "${roleId}" not found`);
        }

        const permission = await this._permissionGroupService.getPermissionById(permissionGroupId);
        if (!permission) {
            throw new Error(`Permission with ID "${permissionGroupId}" not found`);
        }

        const permissionName: string = permission.name;
        if (!role.groups.includes(permissionName)) {
            await rolesCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(roleId) },
                { $push: { groups: permission.name }, $set: { updatedAt: new Date() } },
            );
        } else {
            throw new Error(`Role already contains the specified permission group`);
        }
    }

    async removeGroupFromRole(roleId: string, permissionGroupId: string): Promise<void> {
        const rolesCollection = await getRoleCollection();

        const role: RoleInterface | null = await rolesCollection.findOne({
            _id: new mongoose.Types.ObjectId(roleId),
        });
        if (!role) {
            throw new Error(`Role with ID "${roleId}" not found`);
        }

        const permission = await this._permissionGroupService.getPermissionById(permissionGroupId);
        if (!permission) {
            throw new Error(`PermissionGroup with ID "${permissionGroupId}" not found`);
        }

        const permissionName: string = permission.name;
        if (role.groups.includes(permissionName)) {
            await rolesCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(roleId) },
                { $pull: { groups: permissionName }, $set: { updatedAt: new Date() } },
            );
        } else {
            throw new Error(`Role doesn't contain the specified permission group`);
        }
    }
}
