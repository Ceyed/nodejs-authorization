import { app } from './app';
import { connectToMongo } from './config/db';
import { env } from './config/env';
import { redis } from './config/redis';

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectToMongo();

        // Connect to Redis
        await redis.ping();

        // Start Express server
        app.listen(env.port, () => {
            console.log(`Server running on http://localhost:${env.port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
