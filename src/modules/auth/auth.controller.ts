import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RedisRefreshTokenPrefixConstant } from '../../common/constants/redis/refresh-token-prefix.constant';
import { RedisSessionPrefixConstant } from '../../common/constants/redis/session-prefix.constant';
import { AuthenticatedRequestInterface } from '../../common/interfaces/authenticated-request.interface';
import { JwtRefreshTokenInterface } from '../../common/interfaces/jwt-refresh-token.interface';
import { UserInterface } from '../../common/interfaces/user.interface';
import { env } from '../app/config/env';
import { redis } from '../app/config/redis';
import { PermissionGroupService } from '../rbac/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuthService } from './auth.service';
import { registerSchema } from './auth.validation';

const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
    try {
        const data = registerSchema.parse(req.body);
        const userId: string = await authService.register(data.email, data.password, data.role);
        res.status(201).json({ message: 'User registered successfully', user: userId });
    } catch (error) {
        let errorMessage: string = 'Registration failed';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body;
        const token = await authService.login(email, password);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        let errorMessage: string = 'Login failed';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function logout(req: AuthenticatedRequestInterface, res: Response): Promise<void> {
    try {
        const userId: string | undefined = req.user?.sub;
        if (!userId) {
            res.status(400).json({ message: 'Invalid request' });
            return;
        }
        await redis.del(`session:${userId}`);
        await redis.del(`refreshToken:${userId}`);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        let errorMessage: string = 'Logout failed';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ message: 'Refresh token is required' });
            return;
        }

        const decoded: JwtRefreshTokenInterface = jwt.verify(
            refreshToken,
            env.jwtRefreshSecret,
        ) as JwtRefreshTokenInterface;

        const storedToken: string | null = await redis.get(`refreshToken:${decoded.sub}`);
        if (storedToken !== refreshToken) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        const user: UserInterface | undefined = await authService.findOne(decoded.sub);
        if (!user) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        const { accessToken } = authService.generateTokens({
            sub: '' + user._id,
            email: user.email,
            role: user.role,
        });

        // TODO: no hardcode
        await redis.set(`${RedisSessionPrefixConstant}:${user._id}`, accessToken, 'EX', 3600);
        await redis.set(
            `${RedisRefreshTokenPrefixConstant}:${user._id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60,
        );

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
}

export async function assignRole(req: Request, res: Response): Promise<void> {
    try {
        const { userId, role } = req.body;
        if (!userId || !role) {
            res.status(400).json({ message: 'User ID and role are required' });
            return;
        }

        await authService.assignRole(userId, role);
        res.status(200).json({ message: 'Role assigned successfully' });
    } catch (error) {
        let errorMessage: string = 'Failed to assign role';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function addPermission(req: Request, res: Response): Promise<void> {
    try {
        const { role, permission } = req.body;
        if (!role || !permission) {
            res.status(400).json({ message: 'Role and permission are required' });
            return;
        }

        await RbacService.addPermission(role, permission);
        res.status(200).json({ message: 'Permission added successfully' });
    } catch (error) {
        let errorMessage: string = 'Failed to add permission';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function removePermission(req: Request, res: Response): Promise<void> {
    try {
        const { role, permission } = req.body;
        if (!role || !permission) {
            res.status(400).json({ message: 'Role and permission are required' });
            return;
        }

        await RbacService.removePermission(role, permission);
        res.status(200).json({ message: 'Permission removed successfully' });
    } catch (error) {
        let errorMessage: string = 'Failed to remove permission';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function createPermissionGroup(req: Request, res: Response): Promise<void> {
    try {
        const { name, permissions } = req.body;
        if (!name || !permissions || !Array.isArray(permissions)) {
            res.status(400).json({ message: 'Invalid group data' });
            return;
        }

        await PermissionGroupService.createGroup(name, permissions);
        res.status(201).json({ message: 'Permission group created successfully' });
    } catch (error) {
        let errorMessage: string = 'Failed to create permission group';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}

export async function listPermissionGroups(req: Request, res: Response): Promise<void> {
    try {
        const groups = await PermissionGroupService.listGroups();
        res.status(200).json({ groups });
    } catch (error) {
        let errorMessage: string = 'Failed to list permission groups';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(400).json({ message: errorMessage });
    }
}
