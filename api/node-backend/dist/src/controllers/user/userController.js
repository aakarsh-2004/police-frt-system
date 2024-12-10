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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = require("../../lib/prisma");
const node_path_1 = __importDefault(require("node:path"));
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const node_fs_1 = __importDefault(require("node:fs"));
const otpService_1 = require("../../services/otpService");
const notificationController_1 = require("../notification/notificationController");
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                role: true,
                designation: true,
                userImageUrl: true,
                policeId: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json(users);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while fetching users " + error));
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                role: true,
                designation: true,
                userImageUrl: true,
                policeId: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json(user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while fetching user " + error));
    }
});
exports.getUserById = getUserById;
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, username, email, password, role, designation, phone } = req.body;
    if (!firstName || !lastName || !username || !email || !password || !role || !designation || !phone) {
        return next((0, http_errors_1.default)(400, "Missing required fields"));
    }
    const files = req.files;
    let imageUrl = null;
    try {
        if (files && files.userImageUrl) {
            const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
            const fileName = files.userImageUrl[0].filename;
            const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
            const uploadResponse = yield cloudinary_1.default.uploader.upload(filePath, {
                filename_override: fileName,
                folder: 'user-images',
                format: userImageMimeType
            });
            imageUrl = uploadResponse.secure_url;
            node_fs_1.default.unlinkSync(filePath);
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        if (!phone) {
            return next((0, http_errors_1.default)(400, "Phone number is required"));
        }
        const formattedPhone = otpService_1.OTPService.formatPhoneNumber(phone);
        const user = yield prisma_1.prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                role,
                designation,
                userImageUrl: imageUrl,
                phone: formattedPhone
            }
        });
        // Remove password from response
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        yield (0, notificationController_1.createNotification)(`New user ${firstName} ${lastName} has been created`, 'NEW_USER');
        res.status(201).json({
            message: "User created successfully",
            data: userWithoutPassword
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error creating user: " + error));
    }
});
exports.createUser = createUser;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { firstName, lastName, username, email, password, role, designation, policeId } = req.body;
    try {
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                throw (0, http_errors_1.default)(404, "User not found");
            }
            let updateData = {
                firstName,
                lastName,
                username,
                email,
                role,
                designation,
                policeId
            };
            if (password) {
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                updateData.password = hashedPassword;
            }
            if (req.files && 'userImageUrl' in req.files) {
                const files = req.files;
                const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
                const fileName = files.userImageUrl[0].filename;
                const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
                if (user.userImageUrl) {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        yield cloudinary_1.default.uploader.destroy(userImageSplit);
                    }
                }
                const imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'user-images',
                    format: userImageMimeType
                });
                updateData.userImageUrl = imageUrl.secure_url;
                try {
                    node_fs_1.default.unlinkSync(filePath);
                }
                catch (error) {
                    console.error("Error deleting file:", error);
                }
            }
            const updatedUser = yield prisma.user.update({
                where: { id },
                data: updateData
            });
            const { password: _ } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
            return userWithoutPassword;
        }));
        res.status(200).json(result);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while updating user " + error));
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedBy = req.user;
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                firstName: true,
                lastName: true,
                role: true
            }
        });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found"));
        }
        yield prisma_1.prisma.user.delete({
            where: { id }
        });
        // Create notification for user deletion
        yield (0, notificationController_1.createNotification)(`User ${user.firstName} ${user.lastName} (${user.role}) was deleted by ${deletedBy === null || deletedBy === void 0 ? void 0 : deletedBy.firstName} ${deletedBy === null || deletedBy === void 0 ? void 0 : deletedBy.lastName}`, 'user_deleted');
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error deleting user: " + error));
    }
});
exports.deleteUser = deleteUser;
