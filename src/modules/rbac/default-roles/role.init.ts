import { ModulesEnum } from '../../../common/enums/modules.enum';
import { PermissionsEnum } from '../../../common/enums/permissions.enum';
import { RolesEnum } from '../../../common/enums/roles.enum';
import { getRoleCollection } from '../../../common/interfaces/role.interface';
import { AuthService } from '../../auth/auth.service';
import { PermissionGroupService } from '../group.service';

export async function insertDefaultRecords() {
    const rolesCollection = await getRoleCollection();

    const existingRoles = await rolesCollection.countDocuments();
    if (existingRoles === 0) {
        const permissionGroupService: PermissionGroupService = PermissionGroupService.getInstance();
        const authService: AuthService = AuthService.getInstance();

        const defaultRoles = [
            {
                name: RolesEnum.ADMIN,
                permissions: [],
                groups: [
                    'Admin Role Management',
                    'Admin Blog Management',
                    'Admin Product Management',
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: RolesEnum.EDITOR,
                permissions: [],
                groups: ['Editor Blog Management', 'Editor Product Management'],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: RolesEnum.VIEWER,
                permissions: [],
                groups: ['Viewer Blog Management', 'Viewer Product Management'],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        await rolesCollection.insertMany(defaultRoles);

        // ? Default groups
        // * Admin
        await permissionGroupService.createGroup('Admin Role Management', [
            `${ModulesEnum.ROLE}:${PermissionsEnum.ALL}`,
        ]);
        await permissionGroupService.createGroup('Admin Blog Management', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.ALL}`,
        ]);
        await permissionGroupService.createGroup('Admin Product Management', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.ALL}`,
        ]);

        // * Editor
        await permissionGroupService.createGroup('Editor Blog Management', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.READ}`,
            `${ModulesEnum.BLOG}:${PermissionsEnum.CREATE}`,
            `${ModulesEnum.BLOG}:${PermissionsEnum.UPDATE}`,
        ]);
        await permissionGroupService.createGroup('Editor Product Management', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.READ}`,
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.CREATE}`,
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.UPDATE}`,
        ]);

        // * Viewer
        await permissionGroupService.createGroup('Viewer Blog Management', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.READ}`,
        ]);
        await permissionGroupService.createGroup('Viewer Product Management', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.READ}`,
        ]);

        // ? Default accounts
        await authService.register('admin@test.com', '123', RolesEnum.ADMIN);
        await authService.register('editor@test.com', '123', RolesEnum.EDITOR);
        await authService.register('viewer@test.com', '123', RolesEnum.VIEWER);

        console.log('Default roles initialized');
    }
}
