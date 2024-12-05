export interface Role {
    name: string;
    permissions: string[];
}

export interface UserWithRole {
    userId: string;
    role: string;
}
