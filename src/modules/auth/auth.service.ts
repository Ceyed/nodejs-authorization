import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectToMongo } from '../../config/db';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { User } from './auth.model';

export class AuthService {
    private readonly collectionName = 'users';

    async register(email: string, password: string): Promise<User> {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);

        // Check if the user already exists
        const existingUser = await users.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user: User = {
            email,
            password: hashedPassword,
            role: 'user', // Default role
            createdAt: new Date(),
        };

        // Insert the user into the database
        await users.insertOne(user);

        return user;
    }

    async login(
        email: string,
        password: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);

        // Find user by email
        const user = await users.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT token (Access Token)
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            env.jwtSecret,
            // TODO: remove hardcode
            { expiresIn: '15m' }, // Access token expires in 15 minutes
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign({ userId: user._id }, env.jwtRefreshSecret, {
            // TODO: Remove hardcode
            expiresIn: '7d',
        });

        // Store token in Redis
        await redis.set(`session:${user._id}`, accessToken, 'EX', 3600); // Expire in 1 hour
        await redis.set(`refreshToken:${user._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7 days expiration

        return { accessToken, refreshToken };
    }

    async findOne(userId: string) {
        const db = await connectToMongo();
        const users = db.collection<User>(this.collectionName);

        // Find user by email
        const user = await users.findOne({ _id: new mongoose.Types.ObjectId(userId) });
        if (!user) {
            return undefined;
        }
        return user;
    }
}
