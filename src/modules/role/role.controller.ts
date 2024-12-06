import { Request, Response } from 'express';
import { RoleInterface } from '../../common/interfaces/role.interface';
import { RoleService } from './rbac.service';

const roleService: RoleService = RoleService.getInstance();

export class RoleController {
    private static _instance: RoleController;

    private constructor() {}

    public static getInstance(): RoleController {
        if (!RoleController._instance) {
            RoleController._instance = new RoleController();
        }
        return RoleController._instance;
    }

    async createRole(req: Request, res: Response): Promise<void> {
        try {
            const { name, permissions, permissionGroupIds } = req.body;

            if (!name || !Array.isArray(permissions) || !Array.isArray(permissionGroupIds)) {
                res.status(400).json({ message: 'Invalid input.' });
                return;
            }

            const role: RoleInterface = await roleService.createRole(
                name,
                permissions,
                permissionGroupIds,
            );

            res.status(201).json({ message: 'Role created successfully.', role });
        } catch (error) {
            if (error instanceof Error) {
                res.status(409).json({ message: error.message });
            } else {
                console.error('Error creating role:', error);
                res.status(500).json({ message: 'Internal server error.' });
            }
        }
    }
}
