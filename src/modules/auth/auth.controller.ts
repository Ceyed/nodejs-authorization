import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../app/config/env';
import { redis } from '../app/config/redis';
import { PermissionGroupService } from '../rbac/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuthService } from './auth.service';
import { registerSchema } from './auth.validation';

const authService = new AuthService();

interface AuthenticatedRequestInterface extends Request {
    user?: { sub: string };
}

export const register = async (req: Request, res: Response) => {
    try {
        const data = registerSchema.parse(req.body);
        const userId = await authService.register(data.email, data.password, data.role);
        res.status(201).json({ message: 'User registered successfully', user: userId });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const token = await authService.login(email, password);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Login failed' });
    }
};

export const logout = async (req: AuthenticatedRequestInterface, res: Response): Promise<void> => {
    try {
        const userId = req.user?.sub;

        if (!userId) {
            res.status(400).json({ message: 'Invalid request' });
            return;
        }

        await redis.del(`session:${userId}`);
        await redis.del(`refreshToken:${userId}`);

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
        // TODO: Add type
        // TODO: NO "any" in project
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

        const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as any;

        const storedToken = await redis.get(`refreshToken:${decoded.sub}`);
        if (storedToken !== refreshToken) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        const user = await authService.findOne(decoded.sub);
        if (!user) {
            console.log('here ?');
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }

        // TODO Generate access and refresh tokens in ONE function
        const accessToken = jwt.sign(
            { sub: user._id, email: user.email, role: user.role },
            env.jwtSecret,
            { expiresIn: '15m' },
        );

        // TODO: no hardcode
        await redis.set(`session:${user._id}`, accessToken, 'EX', 3600); // Expire in 1 hour
        await redis.set(`refreshToken:${user._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days expiration

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

export const assignRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, role } = req.body;

        if (!userId || !role) {
            res.status(400).json({ message: 'User ID and role are required' });
            return;
        }

        await authService.assignRole(userId, role);

        res.status(200).json({ message: 'Role assigned successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to assign role' });
    }
};

export const addPermission = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, permission } = req.body;

        if (!role || !permission) {
            res.status(400).json({ message: 'Role and permission are required' });
            return;
        }

        await RbacService.addPermission(role, permission);

        res.status(200).json({ message: 'Permission added successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to add permission' });
    }
};

export const removePermission = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, permission } = req.body;

        if (!role || !permission) {
            res.status(400).json({ message: 'Role and permission are required' });
            return;
        }

        await RbacService.removePermission(role, permission);

        res.status(200).json({ message: 'Permission removed successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to remove permission' });
    }
};

export const createPermissionGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, permissions, description } = req.body;

        if (!name || !permissions || !Array.isArray(permissions)) {
            res.status(400).json({ message: 'Invalid group data' });
            return;
        }

        await PermissionGroupService.createGroup(name, permissions, description);

        res.status(201).json({ message: 'Permission group created successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create permission group' });
    }
};

export const listPermissionGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const groups = await PermissionGroupService.listGroups();
        res.status(200).json({ groups });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to list permission groups' });
    }
};
