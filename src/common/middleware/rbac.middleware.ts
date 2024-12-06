import { NextFunction, Response } from 'express';
import { RbacService } from '../../modules/rbac/rbac.service';
import { ModulesEnum } from '../enums/modules.enum';
import { PermissionsEnum } from '../enums/permissions.enum';
import { AuthenticatedRequestInterface } from '../interfaces/authenticated-request.interface';
import { UserWithRoleInterface } from '../interfaces/role.interface';
import { ModulePermissionType } from '../types/module-permission.type';

export const authorize = (module: ModulesEnum, action: PermissionsEnum) => {
    return async (
        req: AuthenticatedRequestInterface,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const rbacService: RbacService = RbacService.getInstance();

            const user: UserWithRoleInterface | undefined = req.user;
            if (!user || !user.role) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const permissions: ModulePermissionType[] = await rbacService.getPermissions(user.role);

            const requiredPermission: ModulePermissionType = `${module}:${action}`;
            if (!permissions.includes(requiredPermission)) {
                res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
                return;
            }

            next();
        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
            return;
        }
    };
};
