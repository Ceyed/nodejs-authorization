import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../modules/app/config/env';
import { redis } from '../../modules/app/config/redis';

interface AuthenticatedRequestInterface extends Request {
    user?: { id: string };
}

export const protect = async (
    req: AuthenticatedRequestInterface,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        // TODO Add type
        const decoded = jwt.verify(token, env.jwtSecret) as any;

        const redisToken = await redis.get(`session:${decoded.userId}`);
        if (redisToken !== token) {
            res.status(401).json({ message: 'Session expired or invalid' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
