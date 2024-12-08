import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import createHttpError from 'http-errors';

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // User should already be attached by authMiddleware
        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({ message: 'Unauthorized - No user found' });
        }

        if (req.user.role !== 'admin') {
            console.log('User is not admin:', req.user.role);
            return res.status(403).json({ message: 'Forbidden - Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Error in authenticateAdmin:', error);
        next(createHttpError(401, "Unauthorized"));
    }
}; 