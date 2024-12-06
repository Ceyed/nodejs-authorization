import dotenv from 'dotenv';

dotenv.config();

export enum AppEnvEnum {
    PORT = 'PORT',
    MONGO_URI = 'MONGO_URI',
    REDIS_HOST = 'REDIS_HOST',
    REDIS_PORT = 'REDIS_PORT',
    JWT_SECRET = 'JWT_SECRET',
    JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET',
}

function getEnvVariable(key: AppEnvEnum): string {
    const value: string | undefined = process.env[key];
    if (!value) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
    return value;
}

export const env = {
    port: +getEnvVariable(AppEnvEnum.PORT),
    mongoUri: getEnvVariable(AppEnvEnum.MONGO_URI),
    redisHost: getEnvVariable(AppEnvEnum.REDIS_HOST),
    redisPort: +getEnvVariable(AppEnvEnum.REDIS_PORT),
    jwtSecret: getEnvVariable(AppEnvEnum.JWT_SECRET),
    jwtRefreshSecret: getEnvVariable(AppEnvEnum.JWT_REFRESH_SECRET),
};
