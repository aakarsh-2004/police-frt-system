import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config/config';

export interface AuthUser {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        try {
            // Verify token and get decoded data
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

            if (!decoded.userId) {
                console.log('No userId in token');
                return res.status(401).json({ message: 'Invalid token format' });
            }

            // Find user in database
            const user = await prisma.user.findUnique({
                where: { 
                    id: decoded.userId 
                },
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    email: true
                }
            });

            if (!user) {
                console.log('User not found for id:', decoded.userId);
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;

            // Verify admin role for admin routes
            if (req.baseUrl.includes('/api/requests') && user.role !== 'admin') {
                console.log('Non-admin user attempting to access admin route');
                return res.status(403).json({ message: 'Admin access required' });
            }

            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
}; 