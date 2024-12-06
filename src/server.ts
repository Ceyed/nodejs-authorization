import { app } from './modules/app/app';
import { connectToMongo } from './modules/app/config/db';
import { env } from './modules/app/config/env';
import { redis } from './modules/app/config/redis';

const startServer = async () => {
    try {
        await connectToMongo();
        await redis.ping();
        app.listen(env.port, () => {
            console.log(`Server running on http://localhost:${env.port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
