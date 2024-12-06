import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../modules/app/config/env';
import { redis } from '../../modules/app/config/redis';
import { RedisSessionPrefixConstant } from '../constants/redis/session-prefix.constant';
import { AuthenticatedRequestInterface } from '../interfaces/authenticated-request.interface';
import { JwtAccessTokenInterface } from '../interfaces/jwt-access-token.interface';

export const protect = async (
    req: AuthenticatedRequestInterface,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const token: string | undefined = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded: JwtAccessTokenInterface = jwt.verify(
            token,
            env.jwtSecret,
        ) as JwtAccessTokenInterface;

        const redisToken = await redis.get(`${RedisSessionPrefixConstant}:${decoded.sub}`);
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
