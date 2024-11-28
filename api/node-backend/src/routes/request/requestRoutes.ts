import { Router } from "express";
import { getAllRequests, createRequest, approveRequest, rejectRequest } from "../../controllers/request/requestController";
import { authMiddleware } from "../../middleware/auth";
import multer from "multer";
import path from "path";

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 }
});

const requestRouter = Router();

requestRouter.get('/', authMiddleware, getAllRequests);
requestRouter.post('/', authMiddleware, upload.single('personImage'), createRequest);
requestRouter.put('/:id/approve', authMiddleware, approveRequest);
requestRouter.put('/:id/reject', authMiddleware, rejectRequest);

export default requestRouter; 