export interface Role {
    name: string;
    permissions: string[];
}

export interface UserWithRole {
    userId: string;
    role: string;
}

// TODO: Move to db
// * It's for testing
export const roles: Role[] = [
    { name: 'admin', permissions: ['read', 'write', 'delete'] },
    { name: 'editor', permissions: ['read', 'write'] },
    { name: 'viewer', permissions: ['read'] },
];
