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
}
