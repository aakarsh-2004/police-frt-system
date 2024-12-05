import {  config as conf } from 'dotenv';

conf();

const _config = {
    port: process.env.PORT,
    apiKey: process.env.API_KEY,
    dbUri: process.env.DATABASE_URL,
    env: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    cloudinaryCloud: process.env.CLOUDINARY_CLOUD,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: '24h'
}

export const config = Object.freeze(_config);