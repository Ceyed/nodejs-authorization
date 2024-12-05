import { getRoleCollection } from './role.model';

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
        return role.permissions;
    }

    static async hasPermission(roleName: string, permission: string): Promise<boolean> {
        const permissions = await this.getPermissions(roleName);
        return permissions.includes(permission);
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
