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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const prisma_1 = require("../../lib/prisma");
const node_path_1 = __importDefault(require("node:path"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany();
        res.status(200).json(users);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while fetching users " + error));
    }
});
exports.getAllUsers = getAllUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: req.params.id } });
        res.status(200).json(user);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while fetching user " + error));
    }
});
exports.getUserById = getUserById;
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, username, email, password, role, designation, policeId } = req.body;
    const files = req.files;
    const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.userImageUrl[0].filename;
    const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
    try {
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
                    password,
                    role,
                    designation,
                    userImageUrl: imageUrl.secure_url,
                    policeId,
                }
            });
            return user;
        }));
        res.status(201).json(result);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while creating user " + error));
    }
});
exports.createUser = createUser;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { firstName, lastName, username, email, password, role, designation, policeId } = req.body;
    const files = req.files;
    const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.userImageUrl[0].filename;
    const filePath = node_path_1.default.resolve(__dirname, `../../../public/uploads/${fileName}`);
    try {
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: {
                    id: id
                }
            });
            if (!user) {
                next((0, http_errors_1.default)(404, "User not found"));
                return;
            }
            let imageUrl;
            if (files.userImageUrl && user && user.userImageUrl) {
                try {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        yield cloudinary_1.default.uploader.destroy(userImageSplit);
                    }
                    imageUrl = yield cloudinary_1.default.uploader.upload(filePath, {
                        filename_override: fileName,
                        folder: 'user-images',
                        format: userImageMimeType
                    });
                }
                catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting target picture ' + error
                    });
                }
            }
            const updatedUser = yield prisma.user.update({
                where: { id: id },
                data: Object.assign(Object.assign({}, req.body), { userImageUrl: (imageUrl === null || imageUrl === void 0 ? void 0 : imageUrl.secure_url) || user.userImageUrl })
            });
            return updatedUser;
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
            const user = yield prisma.user.findUnique({ where: { id: id } });
            if (!user) {
                next((0, http_errors_1.default)(404, "User not found"));
                return;
            }
            if (user.userImageUrl) {
                try {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        yield cloudinary_1.default.uploader.destroy(userImageSplit);
                    }
                }
                catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting image ' + error
                    });
                }
            }
            const result = yield prisma.user.delete({ where: { id: id } });
            return result;
        }));
        res.status(200).json(result);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error while deleting user " + error));
    }
});
exports.deleteUser = deleteUser;
