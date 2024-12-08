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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithOTP = exports.verifyOTP = exports.sendOTP = exports.verifyToken = exports.login = exports.loginWithPhone = exports.verifyPhoneExists = void 0;
const prisma_1 = require("../../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_errors_1 = __importDefault(require("http-errors"));
const otpService_1 = require("../../services/otpService");
const config_1 = require("../../config/config");
const JWT_SECRET = process.env.JWT_SECRET || '';
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw (0, http_errors_1.default)(400, "Username and password are required");
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                password: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
            }
        });
        if (!user) {
            throw (0, http_errors_1.default)(401, "Invalid username or password");
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw (0, http_errors_1.default)(401, "Invalid username or password");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.config.jwtSecret, { expiresIn: '24h' });
        console.log('Generated token for user:', {
            userId: user.id,
            username: user.username,
            role: user.role
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            token,
            user: userWithoutPassword
        });
    }
    catch (error) {
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
const verifyPhoneExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        if (!phone) {
            throw (0, http_errors_1.default)(400, "Phone number is required");
        }
        // Format phone number to consistent format
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        // Check if user exists with this phone number
        const user = yield prisma_1.prisma.user.findFirst({
            where: { phone: formattedPhone }
        });
        if (!user) {
            throw (0, http_errors_1.default)(404, "No user found with this phone number");
        }
        res.json({
            message: "Phone number verified",
            data: {
                userId: user.id,
                phone: user.phone
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyPhoneExists = verifyPhoneExists;
const loginWithPhone = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, firebaseUid } = req.body;
        if (!phone || !firebaseUid) {
            throw (0, http_errors_1.default)(400, "Phone number and Firebase UID are required");
        }
        // Format phone number
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        // Find user by phone number
        const user = yield prisma_1.prisma.user.findFirst({
            where: { phone: formattedPhone }
        });
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        // Update user's Firebase UID and mark phone as verified
        yield prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                firebaseUid,
                phoneVerified: true
            }
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET || '', { expiresIn: '24h' });
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
exports.loginWithPhone = loginWithPhone;
