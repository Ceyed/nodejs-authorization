import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToMongo } from '../../config/db';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { RbacService } from '../rbac/rbac.service';
import { User } from './auth.model';

export class AuthService {
    // TODO: No hardcode
    private readonly collectionName = 'users';

    async register(email: string, password: string, role: string): Promise<string> {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        if (!RbacService.roleExists(role)) {
            throw new Error('Invalid role');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user: User = {
            createdAt: new Date(),
            email,
            password: hashedPassword,
            role,
        };

        const result = await users.insertOne(user as User);
        return result.insertedId.toString();
    }

    async login(
        email: string,
        password: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);

        const user = await users.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            env.jwtSecret,
            // TODO: remove hardcode
            { expiresIn: '15m' },
        );

        const refreshToken = jwt.sign({ userId: user._id }, env.jwtRefreshSecret, {
            // TODO: Remove hardcode
            expiresIn: '7d',
        });

        await redis.set(`session:${user._id}`, accessToken, 'EX', 3600); // Expire in 1 hour
        await redis.set(`refreshToken:${user._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days expiration

        return { accessToken, refreshToken };
    }

    async findOne(userId: string) {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);
        const user = await users.findOne({ id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return undefined;
        }
        return user;
    }

    async assignRole(userId: string, role: string): Promise<void> {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);

        if (!RbacService.roleExists(role)) {
            throw new Error('Invalid role');
        }

        const result = await users.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { role } },
        );

        if (result.matchedCount === 0) {
            throw new Error('User not found');
        }
    }
}
