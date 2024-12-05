import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redis } from '../config/redis';

interface AuthenticatedRequestInterface extends Request {
    user?: { id: string };
}

export const protect = async (
    req: AuthenticatedRequestInterface,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        // Decode the JWT
        // TODO Add type
        const decoded = jwt.verify(token, env.jwtSecret) as any;

        // Check Redis for active session
        const redisToken = await redis.get(`session:${decoded.userId}`);
        if (redisToken !== token) {
            res.status(401).json({ message: 'Session expired or invalid' });
            return;
        }

        req.user = decoded; // Attach decoded token data to the request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
