"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const config_1 = require("../config/config");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            if (!decoded.userId) {
                console.log('No userId in token');
                return res.status(401).json({ message: 'Invalid token format' });
            }
            // Find user in database
            const user = yield prisma_1.prisma.user.findUnique({
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
        }
        catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Authentication failed' });
    }
});
exports.authMiddleware = authMiddleware;
