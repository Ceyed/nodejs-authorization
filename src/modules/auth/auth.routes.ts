import { Request, Router } from 'express';
import { ModulesEnum } from '../../enums/modules.enum';
import { PermissionsEnum } from '../../enums/permissions.enum';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import {
    addPermission,
    assignRole,
    createPermissionGroup,
    listPermissionGroups,
    login,
    logout,
    refreshAccessToken,
    register,
    removePermission,
} from './auth.controller';

const authRouter = Router();

interface AuthenticatedRequestInterface extends Request {
    user?: { id: string };
}

// ? Authentication
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/protected', protect, (req: AuthenticatedRequestInterface, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});
authRouter.post('/logout', protect, logout);
authRouter.post('/refresh', refreshAccessToken);

// ? Authorization
authRouter.post(
    '/assign-role',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    assignRole,
);
authRouter.post(
    '/add-permission',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    addPermission,
);
authRouter.post(
    '/remove-permission',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    removePermission,
);

// ? Groups
authRouter.post(
    '/permission-groups',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.CREATE),
    createPermissionGroup,
);
authRouter.get(
    '/permission-groups',
    protect,
    authorize(ModulesEnum.ROLE, PermissionsEnum.READ),
    listPermissionGroups,
);

// ? TEST ROUTES
authRouter.get(
    '/read-protected',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.READ),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have read access', user: req.user });
    },
);
authRouter.post(
    '/write-protected',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.CREATE),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have write access', user: req.user });
    },
);
authRouter.delete(
    '/delete-protected',
    protect,
    authorize(ModulesEnum.BLOG, PermissionsEnum.DELETE),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have delete access', user: req.user });
    },
);

export { authRouter };
