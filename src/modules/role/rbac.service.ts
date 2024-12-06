import { PermissionGroup } from '../../common/interfaces/permission-group.interface';
import { getRoleCollection, RoleInterface } from '../../common/interfaces/role.interface';
import { ModulePermissionType } from '../../common/types/module-permission.type';
import { PermissionGroupService } from '../rbac/group.service';

export class RoleService {
    static async createRole(name: string, permissions: ModulePermissionType[], groups: string[]) {
        const roleCollection = await getRoleCollection();

        const existingRole: RoleInterface | null = await roleCollection.findOne({ name });
        if (existingRole) {
            throw new Error('Role already exists');
        }

        const validGroups: PermissionGroup[] = await PermissionGroupService.getGroupsByNames(
            groups,
        );
        if (validGroups.length !== groups.length) {
            throw new Error('One or more groups are invalid.');
        }

        const role: RoleInterface = {
            createdAt: new Date(),
            updatedAt: new Date(),
            name,
            permissions,
            groups,
        };
        await roleCollection.insertOne(role);
        return role;
    }
}
