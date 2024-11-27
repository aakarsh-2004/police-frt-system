"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/user/userController");
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: node_path_1.default.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 } // 30mb
});
const userRouter = (0, express_1.Router)();
userRouter.get('/', userController_1.getAllUsers);
userRouter.get('/:id', userController_1.getUserById);
userRouter.post('/', upload.fields([
    { name: 'userImageUrl', maxCount: 1 }
]), userController_1.createUser);
userRouter.put('/:id', upload.fields([
    { name: 'userImageUrl', maxCount: 1 }
]), userController_1.updateUser);
userRouter.delete('/:id', userController_1.deleteUser);
exports.default = userRouter;
