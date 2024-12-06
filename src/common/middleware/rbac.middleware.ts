import { NextFunction, Request, Response } from 'express';
import { RbacService } from '../../modules/rbac/rbac.service';
import { ModulesEnum } from '../enums/modules.enum';
import { PermissionsEnum } from '../enums/permissions.enum';
import { UserWithRole } from '../models/rbac.model';

interface AuthenticatedRequestInterface extends Request {
    user?: UserWithRole;
}

export const authorize = (module: ModulesEnum, action: PermissionsEnum) => {
    return async (
        req: AuthenticatedRequestInterface,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user;
            if (!user || !user.role) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const permissions = await RbacService.getPermissions(user.role);

            const requiredPermission = `${module}:${action}`;
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
