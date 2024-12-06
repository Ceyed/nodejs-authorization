import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis({
    host: env.redisHost,
    port: env.redisPort,
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.error('Redis Error:', err));
