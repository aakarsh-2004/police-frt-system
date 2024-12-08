import { Router } from "express";
import { getAllRequests, createRequest, approveRequest, rejectRequest } from "../../controllers/request/requestController";
import { authMiddleware } from "../../middleware/auth";
import { authenticateAdmin } from "../../middleware/authenticateAdmin";
import multer from "multer";
import path from "path";

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads')
});

const requestRouter = Router();

// Apply auth middleware to all routes
requestRouter.use(authMiddleware);

// Get all requests - admin only
requestRouter.get('/', authenticateAdmin, getAllRequests);

// Create request - any authenticated user
requestRouter.post('/', upload.single('personImageUrl'), createRequest);

// Approve/reject requests - admin only
requestRouter.put('/:id/approve', authenticateAdmin, approveRequest);
requestRouter.put('/:id/reject', authenticateAdmin, rejectRequest);

export default requestRouter;