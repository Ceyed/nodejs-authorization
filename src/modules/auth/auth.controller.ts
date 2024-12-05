import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { AuthService } from './auth.service';
import { registerSchema } from './auth.validation';

const authService = new AuthService();

interface AuthenticatedRequestInterface extends Request {
    user?: { id: string; userId: string };
}

export const register = async (req: Request, res: Response) => {
    try {
        // Validate input
        const data = registerSchema.parse(req.body);

        // Register the user
        const user = await authService.register(data.email, data.password);

        // Respond with success
        res.status(201).json({
            message: 'User registered successfully',
            user: { email: user.email, role: user.role },
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // Get email and password from the request body
        const { email, password } = req.body;

        // Attempt to login
        const token = await authService.login(email, password);

        // Respond with the JWT token
        res.status(200).json({ message: 'Login successful', token });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Login failed' });
    }
};

export const logout = async (req: AuthenticatedRequestInterface, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({ message: 'Invalid request' });
            return;
        }

        // Remove the session from Redis
        await redis.del(`session:${userId}`);
        await redis.del(`refreshToken:${userId}`);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Logout failed' });
    }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as any;

        // Check Redis for stored refresh token
        const storedToken = await redis.get(`refreshToken:${decoded.userId}`);
        if (storedToken !== refreshToken) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        const user = await authService.findOne(decoded.userId);
        if (!user) {
            console.log('here ?');
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        // Generate a new access token
        // TODO Generate access and refresh tokens in ONE function
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            env.jwtSecret,
            { expiresIn: '15m' },
        );

        await redis.set(`session:${user._id}`, accessToken, 'EX', 3600); // Expire in 1 hour
        await redis.set(`refreshToken:${user._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days expiration

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
