import { Request, Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { login, logout, refreshAccessToken, register } from './auth.controller';

const authRouter = Router();

interface AuthenticatedRequestInterface extends Request {
    user?: { id: string };
}

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/protected', protect, (req: AuthenticatedRequestInterface, res) => {
    res.status(200).json({ message: 'This is a protected route', user: req.user });
});
authRouter.post('/logout', protect, logout);
authRouter.post('/refresh', refreshAccessToken);

// Protected route for reading
authRouter.get(
    '/read-protected',
    protect,
    authorize('read'),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have read access', user: req.user });
    },
);

// Protected route for writing
authRouter.post(
    '/write-protected',
    protect,
    authorize('write'),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have write access', user: req.user });
    },
);

// Protected route for deleting
authRouter.delete(
    '/delete-protected',
    protect,
    authorize('delete'),
    (req: AuthenticatedRequestInterface, res) => {
        res.status(200).json({ message: 'You have delete access', user: req.user });
    },
);

export { authRouter };
