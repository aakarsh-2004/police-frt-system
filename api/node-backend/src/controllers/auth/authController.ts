import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from "http-errors";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            throw createHttpError(400, "Username and password are required");
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            console.log('User not found:', username);
            throw createHttpError(401, "Invalid credentials");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            console.log('Invalid password for user:', username);
            throw createHttpError(401, "Invalid credentials");
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userImageUrl: user.userImageUrl
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw createHttpError(401, "No token provided");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            throw createHttpError(401, "Invalid token");
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userImageUrl: user.userImageUrl
            }
        });
    } catch (error) {
        next(error);
    }
}; 