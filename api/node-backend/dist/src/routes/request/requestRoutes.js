"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestController_1 = require("../../controllers/request/requestController");
const auth_1 = require("../../middleware/auth");
const authenticateAdmin_1 = require("../../middleware/authenticateAdmin");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    dest: path_1.default.resolve(__dirname, '../../../public/uploads')
});
const requestRouter = (0, express_1.Router)();
// Apply auth middleware to all routes
requestRouter.use(auth_1.authMiddleware);
// Get all requests - admin only
requestRouter.get('/', authenticateAdmin_1.authenticateAdmin, requestController_1.getAllRequests);
// Create request - any authenticated user
requestRouter.post('/', upload.single('personImageUrl'), requestController_1.createRequest);
// Approve/reject requests - admin only
requestRouter.put('/:id/approve', authenticateAdmin_1.authenticateAdmin, requestController_1.approveRequest);
requestRouter.put('/:id/reject', authenticateAdmin_1.authenticateAdmin, requestController_1.rejectRequest);
exports.default = requestRouter;
