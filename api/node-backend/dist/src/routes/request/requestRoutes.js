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
// Configure multer for image uploads
const upload = (0, multer_1.default)({
    dest: path_1.default.resolve(__dirname, '../../../public/uploads'),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});
const requestRouter = (0, express_1.Router)();
// Apply auth middleware to all routes
requestRouter.use(auth_1.authMiddleware);
requestRouter.post('/', upload.single('personImage'), requestController_1.createRequest);
requestRouter.get('/', requestController_1.getAllRequests);
requestRouter.put('/:id/approve', authenticateAdmin_1.authenticateAdmin, requestController_1.approveRequest);
requestRouter.put('/:id/reject', authenticateAdmin_1.authenticateAdmin, requestController_1.rejectRequest);
exports.default = requestRouter;
