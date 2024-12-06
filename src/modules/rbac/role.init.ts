import { getRoleCollection } from '../../common/models/role.model';

export const initializeRoles = async () => {
    const rolesCollection = await getRoleCollection();

    // * Random default groups
    // await PermissionGroupService.createGroup('Role Management', ['role:all']);
    // await PermissionGroupService.createGroup('Blog Manager', ['blog:all']);
    // await PermissionGroupService.createGroup('Product Manager', ['product:read']);

    const defaultRoles = [
        {
            name: 'admin',
            permissions: [],
            groups: ['Blog Manager', 'Product Manager', 'Role Manager', 'User Group Manager'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'editor',
            permissions: [],
            groups: ['Blog Manager'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'viewer',
            permissions: [],
            groups: ['Product Manager'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const existingRoles = await rolesCollection.countDocuments();
    if (existingRoles === 0) {
        await rolesCollection.insertMany(defaultRoles);
        console.log('Default roles initialized with groups and permissions.');
    }
};
