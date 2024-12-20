import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RedisRefreshTokenPrefixConstant } from '../../common/constants/redis/refresh-token-prefix.constant';
import { RedisSessionPrefixConstant } from '../../common/constants/redis/session-prefix.constant';
import {
    RedisAccessTokenTtl,
    RedisRefreshTokenTtl,
} from '../../common/constants/redis/tokens-ttl.constants';
import { AuthenticatedRequestInterface } from '../../common/interfaces/authenticated-request.interface';
import { JwtRefreshTokenInterface } from '../../common/interfaces/jwt-refresh-token.interface';
import { UserInterface } from '../../common/interfaces/user.interface';
import { ModulePermissionType } from '../../common/types/module-permission.type';
import { env } from '../app/config/env';
import { redis } from '../app/config/redis';
import { PermissionGroupService } from '../rbac/group.service';
import { RbacService } from '../rbac/rbac.service';
import { AuthService } from './auth.service';
import { registerSchema } from './validation/auth.validation';
import { createPermissionGroupSchema } from './validation/permission-group.validation';

export class AuthController {
    private static _instance: AuthController;
    private readonly _authService: AuthService = AuthService.getInstance();
    private readonly _rbacService: RbacService = RbacService.getInstance();
    private readonly _permissionGroupService: PermissionGroupService =
        PermissionGroupService.getInstance();

    private constructor() {}

    public static getInstance(): AuthController {
        if (!AuthController._instance) {
            AuthController._instance = new AuthController();
        }
        return AuthController._instance;
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const data = registerSchema.parse(req.body);
            const userId: string = await this._authService.register(
                data.email,
                data.password,
                data.role,
            );
            res.status(201).json({ message: 'User registered successfully', user: userId });
        } catch (error) {
            let errorMessage: string = 'Registration failed';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const token = await this._authService.login(email, password);
            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            console.error(error);
            let errorMessage: string = 'Login failed';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    async logout(req: AuthenticatedRequestInterface, res: Response): Promise<void> {
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

    async refreshAccessToken(req: Request, res: Response): Promise<void> {
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

            const user: UserInterface | undefined = await this._authService.findOne(decoded.sub);
            if (!user) {
                res.status(401).json({ message: 'Invalid or expired refresh token' });
                return;
            }

            const { accessToken } = this._authService.generateTokens({
                sub: '' + user._id,
                email: user.email,
                role: user.role,
            });

            await redis.set(
                `${RedisSessionPrefixConstant}:${user._id}`,
                accessToken,
                'EX',
                RedisAccessTokenTtl,
            );
            await redis.set(
                `${RedisRefreshTokenPrefixConstant}:${user._id}`,
                refreshToken,
                'EX',
                RedisRefreshTokenTtl,
            );

            res.status(200).json({ accessToken });
        } catch (error) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }

    async assignRole(req: Request, res: Response): Promise<void> {
        try {
            const { userId, roleId } = req.body;
            if (!userId || !roleId) {
                res.status(400).json({ message: 'User ID and role are required' });
                return;
            }

            await this._authService.assignRole(userId, roleId);
            res.status(200).json({ message: 'Role assigned successfully' });
        } catch (error) {
            let errorMessage: string = 'Failed to assign role';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    async addGroupToRole(req: Request, res: Response): Promise<void> {
        try {
            const { roleId, permissionGroupId } = req.body;
            if (!roleId || !permissionGroupId) {
                res.status(400).json({ message: 'Role ID and permission ID are required' });
                return;
            }

            await this._rbacService.addGroupToRole(roleId, permissionGroupId);
            res.status(200).json({ message: 'Permission added successfully' });
        } catch (error) {
            let errorMessage: string = 'Failed to add permission';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    async removeGroupFromRole(req: Request, res: Response): Promise<void> {
        try {
            const { roleId, permissionGroupId } = req.body;
            if (!roleId || !permissionGroupId) {
                res.status(400).json({ message: 'Role and permission are required' });
                return;
            }

            await this._rbacService.removeGroupFromRole(roleId, permissionGroupId);
            res.status(200).json({ message: 'Permission removed successfully' });
        } catch (error) {
            let errorMessage: string = 'Failed to remove permission';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    async createPermissionGroup(req: Request, res: Response): Promise<void> {
        try {
            const parsedBody = createPermissionGroupSchema.safeParse(req.body);

            if (!parsedBody.success) {
                res.status(400).json({ message: parsedBody.error.errors[0].message });
                return;
            }

            const { name, permissions } = parsedBody.data;

            await this._permissionGroupService.createGroup(
                name,
                permissions as ModulePermissionType[],
            );
            res.status(201).json({ message: 'Permission group created successfully' });
        } catch (error) {
            let errorMessage: string = 'Failed to create permission group';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }

    async listPermissionGroups(req: Request, res: Response): Promise<void> {
        try {
            const groups = await this._permissionGroupService.listGroups();
            res.status(200).json({ groups });
        } catch (error) {
            let errorMessage: string = 'Failed to list permission groups';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(400).json({ message: errorMessage });
        }
    }
}
