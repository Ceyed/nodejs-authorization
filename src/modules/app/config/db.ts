import { MongoClient } from 'mongodb';
import { env } from './env';

let client: MongoClient;

export const connectToMongo = async () => {
    if (!client) {
        client = new MongoClient(env.mongoUri);
        await client.connect();
        console.log('Connected to MongoDB');
    }
    return client.db();
};
