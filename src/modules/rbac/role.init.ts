import { ModulesEnum } from '../../common/enums/modules.enum';
import { PermissionsEnum } from '../../common/enums/permissions.enum';
import { getRoleCollection } from '../../common/models/role.model';
import { PermissionGroupService } from './group.service';

export const initializeRoles = async () => {
    const rolesCollection = await getRoleCollection();

    const defaultRoles = [
        {
            name: 'admin',
            permissions: [],
            groups: ['Admin Role Management', 'Admin Blog Management', 'Admin Product Management'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'editor',
            permissions: [],
            groups: ['Editor Blog Management', 'Editor Product Management'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'viewer',
            permissions: [],
            groups: ['Viewer Blog Management', 'Viewer Product Management'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const existingRoles = await rolesCollection.countDocuments();
    if (existingRoles === 0) {
        await rolesCollection.insertMany(defaultRoles);

        // ? Random default groups
        // * Admin
        await PermissionGroupService.createGroup('Admin Role Management', [
            `${ModulesEnum.ROLE}:${PermissionsEnum.ALL}`,
        ]);
        await PermissionGroupService.createGroup('Admin Blog Management', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.ALL}`,
        ]);
        await PermissionGroupService.createGroup('Admin Product Management', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.ALL}`,
        ]);

        // * Editor
        await PermissionGroupService.createGroup('Editor Blog Management', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.READ}`,
            `${ModulesEnum.BLOG}:${PermissionsEnum.CREATE}`,
            `${ModulesEnum.BLOG}:${PermissionsEnum.UPDATE}`,
        ]);
        await PermissionGroupService.createGroup('Editor Product Management', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.READ}`,
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.CREATE}`,
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.UPDATE}`,
        ]);

        // * Viewer
        await PermissionGroupService.createGroup('Viewer Blog Management', [
            `${ModulesEnum.BLOG}:${PermissionsEnum.READ}`,
        ]);
        await PermissionGroupService.createGroup('Viewer Product Management', [
            `${ModulesEnum.PRODUCT}:${PermissionsEnum.READ}`,
        ]);

        console.log('Default roles initialized');
    }
};
