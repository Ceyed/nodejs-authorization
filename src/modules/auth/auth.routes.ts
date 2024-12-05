import { Request, Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
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

export { authRouter };
