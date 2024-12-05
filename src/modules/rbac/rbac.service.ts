import { roles } from './rbac.model';

export class RbacService {
    static roleExists(roleName: string): boolean {
        return roles.some((role) => role.name === roleName);
    }

    static getPermissions(roleName: string): string[] {
        const role = roles.find((role) => role.name === roleName);
        return role ? role.permissions : [];
    }

    static hasPermission(roleName: string, permission: string): boolean {
        const permissions = this.getPermissions(roleName);
        return permissions.includes(permission);
    }

    static addPermission(roleName: string, permission: string): void {
        const role = roles.find((r) => r.name === roleName);
        if (!role) {
            throw new Error('Role not found');
        }

        if (!role.permissions.includes(permission)) {
            role.permissions.push(permission);
        }
    }

    static removePermission(roleName: string, permission: string): void {
        const role = roles.find((r) => r.name === roleName);
        if (!role) {
            throw new Error('Role not found');
        }

        role.permissions = role.permissions.filter((p) => p !== permission);
    }
}
