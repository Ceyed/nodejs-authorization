import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { InsertOneResult } from 'mongodb';
import mongoose, { UpdateResult } from 'mongoose';
import { UsersMongoCollectionNameConstant } from '../../common/constants/mongo/users-collection.constant';
import { RedisSessionPrefixConstant } from '../../common/constants/redis/session-prefix.constant';
import {
    RedisAccessTokenTtl,
    RedisRefreshTokenTtl,
} from '../../common/constants/redis/tokens-ttl.constants';
import { RolesEnum } from '../../common/enums/roles.enum';
import { AccessAndRefreshTokenInterface } from '../../common/interfaces/access-and-refresh-tokens.interface';
import { JwtAccessTokenInterface } from '../../common/interfaces/jwt-access-token.interface';
import { JwtRefreshTokenInterface } from '../../common/interfaces/jwt-refresh-token.interface';
import { RoleInterface } from '../../common/interfaces/role.interface';
import { UserInterface } from '../../common/interfaces/user.interface';
import { connectToMongo } from '../app/config/db';
import { env } from '../app/config/env';
import { redis } from '../app/config/redis';
import { RbacService } from '../rbac/rbac.service';
import { RedisRefreshTokenPrefixConstant } from './../../common/constants/redis/refresh-token-prefix.constant';

export class AuthService {
    private readonly collectionName = UsersMongoCollectionNameConstant;

    async register(email: string, password: string, role: RolesEnum): Promise<string> {
        const db = await connectToMongo();
        const users = db.collection<UserInterface>(this.collectionName);

        const existingUser: UserInterface | null = await users.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const roleExists: boolean = await RbacService.roleExistsByName(role);
        if (!roleExists) {
            throw new Error('Invalid role');
        }

        const hashedPassword: string = await bcrypt.hash(password, 10);
        const user: Partial<UserInterface> = {
            createdAt: new Date(),
            email,
            password: hashedPassword,
            role,
        };
        const result: InsertOneResult<UserInterface> = await users.insertOne(user as UserInterface);
        return result.insertedId.toString();
    }

    async login(email: string, password: string): Promise<AccessAndRefreshTokenInterface> {
        const db = await connectToMongo();
        const users = db.collection<UserInterface>(this.collectionName);

        const user: UserInterface | null = await users.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const passwordMatch: boolean = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        const { accessToken, refreshToken } = this.generateTokens({
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

        return { accessToken, refreshToken };
    }

    async findOne(userId: string): Promise<UserInterface | undefined> {
        const db = await connectToMongo();
        const users = db.collection<UserInterface>(this.collectionName);
        const user: UserInterface | null = await users.findOne({
            _id: new mongoose.Types.ObjectId(userId),
        });
        if (!user) {
            return undefined;
        }
        return user;
    }

    async assignRole(userId: string, roleId: string): Promise<void> {
        const db = await connectToMongo();
        const users = db.collection<UserInterface>(this.collectionName);

        const role: RoleInterface | null = await RbacService.findRole(roleId);
        if (!role) {
            throw new Error('Invalid role');
        }

        const result: UpdateResult = await users.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { role: role.name as RolesEnum } },
        );
        if (result.matchedCount === 0) {
            throw new Error('User not found');
        }
    }

    generateTokens(user: Partial<JwtAccessTokenInterface>): AccessAndRefreshTokenInterface {
        const accessTokenPayload: Partial<JwtAccessTokenInterface> = {
            sub: user.sub,
            email: user.email,
            role: user.role,
        };
        const accessToken: string = jwt.sign(accessTokenPayload, env.jwtSecret, {
            expiresIn: '15m',
        });

        const refreshTokenPayload: Partial<JwtRefreshTokenInterface> = { sub: user.sub };
        const refreshToken: string = jwt.sign(refreshTokenPayload, env.jwtRefreshSecret, {
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
}
