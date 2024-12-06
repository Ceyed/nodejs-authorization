import { Request, Router } from 'express';
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
authRouter.post('/assign-role', protect, authorize('role', 'write'), assignRole);
authRouter.post('/add-permission', protect, authorize('role', 'write'), addPermission);
authRouter.post('/remove-permission', protect, authorize('role', 'write'), removePermission);

// ? Groups
authRouter.post('/permission-groups', protect, authorize('role', 'write'), createPermissionGroup);
authRouter.get('/permission-groups', protect, authorize('role', 'read'), listPermissionGroups);

// ? TEST ROUTES
authRouter.get(
    '/read-protected',
    protect,
    authorize('blog', 'read'),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have read access', user: req.user });
    },
);
authRouter.post(
    '/write-protected',
    protect,
    authorize('blog', 'write'),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have write access', user: req.user });
    },
);
authRouter.delete(
    '/delete-protected',
    protect,
    authorize('blog', 'delete'),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have delete access', user: req.user });
    },
);

export { authRouter };
