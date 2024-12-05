import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { config } from '../config/config';

interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw createHttpError(401, 'Authorization header missing');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw createHttpError(401, 'Token missing');
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as {
                id: string;
                username: string;
                role: string;
            };

            req.user = decoded;
            next();
        } catch (error) {
            throw createHttpError(401, 'Invalid token');
        }
    } catch (error) {
        next(error);
    }
}; 