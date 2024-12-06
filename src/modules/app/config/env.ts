import dotenv from 'dotenv';

dotenv.config();

// TODO: Handle empty .env file

export const env = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || '',
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: Number(process.env.REDIS_PORT) || 6379,
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'secret',
};
