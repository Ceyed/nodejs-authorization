import { NextFunction, Request, Response } from 'express';
import { UserWithRole } from '../modules/rbac/rbac.model';
import { RbacService } from '../modules/rbac/rbac.service';

interface AuthenticatedRequestInterface extends Request {
    user?: UserWithRole;
}

export const authorize = (requiredPermission: string) => {
    return (req: AuthenticatedRequestInterface, res: Response, next: NextFunction): void => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                res.status(403).json({ message: 'Role not assigned' });
                return;
            }

            if (!RbacService.hasPermission(userRole, requiredPermission)) {
                res.status(403).json({ message: 'Access denied' });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    };
};
