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
exports.loginWithOTP = exports.verifyOTP = exports.sendOTP = exports.verifyToken = exports.login = void 0;
const prisma_1 = require("../../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_errors_1 = __importDefault(require("http-errors"));
const otpService_1 = require("../../services/otpService");
const JWT_SECRET = process.env.JWT_SECRET || '';
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw (0, http_errors_1.default)(400, "Username and password are required");
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: { username }
        });
        if (!user) {
            console.log('User not found:', username);
            throw (0, http_errors_1.default)(401, "Invalid credentials");
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', username);
            throw (0, http_errors_1.default)(401, "Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        next(error);
    }
});
exports.login = login;
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw (0, http_errors_1.default)(401, "No token provided");
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            throw (0, http_errors_1.default)(401, "Invalid token");
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
    }
    catch (error) {
        next(error);
    }
});
exports.verifyToken = verifyToken;
const sendOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        const formattedPhone = otpService_1.OTPService.formatPhoneNumber(phone);
        const user = yield prisma_1.prisma.user.findUnique({
            where: { phone: formattedPhone }
        });
        if (!user) {
            throw (0, http_errors_1.default)(404, "No user found with this phone number");
        }
        yield otpService_1.OTPService.sendOTP(formattedPhone);
        res.json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.error('Error in sendOTP:', error);
        next(error);
    }
});
exports.sendOTP = sendOTP;
const verifyOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, otp } = req.body;
        const formattedPhone = otpService_1.OTPService.formatPhoneNumber(phone);
        const isValid = yield otpService_1.OTPService.verifyOTP(formattedPhone, otp);
        if (!isValid) {
            throw (0, http_errors_1.default)(400, "Invalid or expired OTP");
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: { phone: formattedPhone }
        });
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        next(error);
    }
});
exports.verifyOTP = verifyOTP;
const loginWithOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phone, otp } = req.body;
        phone = phone.replace(/\D/g, '');
        phone = phone.replace(/^91/, '');
        phone = `+91${phone}`;
        const user = yield prisma_1.prisma.user.findUnique({
            where: { phone }
        });
        if (!user || !user.otpSecret || !user.otpExpiry) {
            throw (0, http_errors_1.default)(400, "Invalid OTP request");
        }
        if (new Date() > user.otpExpiry) {
            throw (0, http_errors_1.default)(400, "OTP has expired");
        }
        const isValidOTP = yield bcrypt_1.default.compare(otp, user.otpSecret);
        if (!isValidOTP) {
            throw (0, http_errors_1.default)(400, "Invalid OTP");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        yield prisma_1.prisma.user.update({
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
    }
    catch (error) {
        next(error);
    }
});
exports.loginWithOTP = loginWithOTP;
