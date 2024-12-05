import { getRoleCollection } from './role.model';

export const initializeRoles = async () => {
    const rolesCollection = await getRoleCollection();

    const defaultRoles = [
        {
            name: 'admin',
            permissions: ['read', 'write', 'delete'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: 'editor',
            permissions: ['read', 'write'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        { name: 'viewer', permissions: ['read'], createdAt: new Date(), updatedAt: new Date() },
    ];

    const existingRoles = await rolesCollection.countDocuments();
    if (existingRoles === 0) {
        await rolesCollection.insertMany(defaultRoles);
        console.log('Default roles initialized.');
    }
};
