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
    const { firstName, lastName, username, email, password, role, designation, policeId } = req.body;
    if (!firstName || !lastName || !username || !email || !password || !role || !designation) {
        return next((0, http_errors_1.default)(400, "Missing required fields"));
    }
    const files = req.files;
    const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.userImageUrl[0].filename;
    const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
    try {
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                filename_override: fileName,
                folder: 'user-images',
                format: userImageMimeType
            });
            const user = yield prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username,
                    email,
                    password: hashedPassword, // Use hashed password
                    role,
                    designation,
                    userImageUrl: imageUrl.secure_url,
                    policeId,
                }
            });
            // Don't send password in response
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while creating user " + error));
    }
    finally {
        try {
            node_fs_1.default.unlinkSync(filePath);
        }
        catch (error) {
            next((0, http_errors_1.default)(500, "Error while deleting file " + error));
        }
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
            // Only hash and update password if it's provided
            if (password) {
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                updateData.password = hashedPassword;
            }
            // Handle image update if provided
            if (req.files && 'userImageUrl' in req.files) {
                const files = req.files;
                const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
                const fileName = files.userImageUrl[0].filename;
                const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
                // Delete old image from cloudinary if exists
                if (user.userImageUrl) {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        yield cloudinary_1.default.uploader.destroy(userImageSplit);
                    }
                }
                // Upload new image
                const imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'user-images',
                    format: userImageMimeType
                });
                updateData.userImageUrl = imageUrl.secure_url;
                // Clean up uploaded file
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
            // Don't send password in response
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
    try {
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                throw (0, http_errors_1.default)(404, "User not found");
            }
            if (user.userImageUrl) {
                const userSplit = user.userImageUrl.split('/');
                const lastTwo = userSplit.slice(-2);
                if (lastTwo.length === 2) {
                    const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                    yield cloudinary_1.default.uploader.destroy(userImageSplit);
                }
            }
            const deletedUser = yield prisma.user.delete({
                where: { id }
            });
            // Don't send password in response
            const { password: _ } = deletedUser, userWithoutPassword = __rest(deletedUser, ["password"]);
            return userWithoutPassword;
        }));
        res.status(200).json(result);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while deleting user " + error));
    }
});
exports.deleteUser = deleteUser;
