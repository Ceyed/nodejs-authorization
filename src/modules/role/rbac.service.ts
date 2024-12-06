import { PermissionGroup } from '../../common/interfaces/permission-group.interface';
import { getRoleCollection, RoleInterface } from '../../common/interfaces/role.interface';
import { ModulePermissionType } from '../../common/types/module-permission.type';
import { PermissionGroupService } from './../rbac/group.service';

export class RoleService {
    private static _instance: RoleService;
    private readonly _permissionGroupService: PermissionGroupService =
        PermissionGroupService.getInstance();

    private constructor() {}

    public static getInstance(): RoleService {
        if (!RoleService._instance) {
            RoleService._instance = new RoleService();
        }
        return RoleService._instance;
    }

    async createRole(
        name: string,
        permissions: ModulePermissionType[],
        permissionGroupIds: string[],
    ): Promise<RoleInterface> {
        const roleCollection = await getRoleCollection();

        const existingRole: RoleInterface | null = await roleCollection.findOne({ name });
        if (existingRole) {
            throw new Error('Role already exists');
        }

        const validGroups: PermissionGroup[] = await this._permissionGroupService.getGroupsByIds(
            permissionGroupIds,
        );
        if (validGroups.length !== permissionGroupIds.length) {
            throw new Error('One or more permission group IDs are invalid.');
        }

        const role: RoleInterface = {
            createdAt: new Date(),
            updatedAt: new Date(),
            name,
            permissions,
            groups: validGroups.map((group) => group.name),
        };

        await roleCollection.insertOne(role);
        return role;
    }
}
