"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestController_1 = require("../../controllers/request/requestController");
const auth_1 = require("../../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    dest: path_1.default.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 }
});
const requestRouter = (0, express_1.Router)();
requestRouter.get('/', auth_1.authMiddleware, requestController_1.getAllRequests);
requestRouter.post('/', auth_1.authMiddleware, upload.single('personImage'), requestController_1.createRequest);
requestRouter.put('/:id/approve', auth_1.authMiddleware, requestController_1.approveRequest);
requestRouter.put('/:id/reject', auth_1.authMiddleware, requestController_1.rejectRequest);
exports.default = requestRouter;
