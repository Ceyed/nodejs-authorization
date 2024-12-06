import { Request, Response } from 'express';
import { RoleInterface } from '../../common/interfaces/role.interface';
import { RoleService } from './rbac.service';

export class RoleController {
    static async createRole(req: Request, res: Response): Promise<void> {
        try {
            const { name, permissions, groups } = req.body;

            if (!name || !Array.isArray(permissions) || !Array.isArray(groups)) {
                res.status(400).json({ message: 'Invalid input.' });
                return;
            }

            const role: RoleInterface = await RoleService.createRole(name, permissions, groups);

            res.status(201).json({ message: 'Role created successfully.', role });
        } catch (error) {
            console.error('Error creating role:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
}
