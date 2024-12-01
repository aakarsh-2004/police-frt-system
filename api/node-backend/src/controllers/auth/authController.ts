import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from "http-errors";
import { OTPService } from "../../services/otpService";

const JWT_SECRET = process.env.JWT_SECRET || '';

const login = async (req: Request, res: Response, next: NextFunction) => {
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

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
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

const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone } = req.body;
        const formattedPhone = OTPService.formatPhoneNumber(phone);

        const user = await prisma.user.findUnique({
            where: { phone: formattedPhone }
        });

        if (!user) {
            throw createHttpError(404, "No user found with this phone number");
        }

        await OTPService.sendOTP(formattedPhone);

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error('Error in sendOTP:', error);
        next(error);
    }
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phone, otp } = req.body;
        const formattedPhone = OTPService.formatPhoneNumber(phone);

        const isValid = await OTPService.verifyOTP(formattedPhone, otp);
        if (!isValid) {
            throw createHttpError(400, "Invalid or expired OTP");
        }

        const user = await prisma.user.findUnique({
            where: { phone: formattedPhone }
        });

        if (!user) {
            throw createHttpError(404, "User not found");
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
                phone: user.phone,
                userImageUrl: user.userImageUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

const loginWithOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { phone, otp } = req.body;

        phone = phone.replace(/\D/g, '');
        phone = phone.replace(/^91/, '');
        phone = `+91${phone}`;

        const user = await prisma.user.findUnique({
            where: { phone }
        });

        if (!user || !user.otpSecret || !user.otpExpiry) {
            throw createHttpError(400, "Invalid OTP request");
        }

        if (new Date() > user.otpExpiry) {
            throw createHttpError(400, "OTP has expired");
        }

        const isValidOTP = await bcrypt.compare(otp, user.otpSecret);
        if (!isValidOTP) {
            throw createHttpError(400, "Invalid OTP");
        }

        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        await prisma.user.update({
            where: { id: user.id },
            data: {
                phoneVerified: true,
                otpSecret: null,
                otpExpiry: null
            }
        });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userImageUrl: user.userImageUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

export { login, verifyToken, sendOTP, verifyOTP, loginWithOTP }; 