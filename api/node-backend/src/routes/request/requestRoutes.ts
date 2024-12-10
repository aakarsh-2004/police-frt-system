import { Router } from "express";
import { getAllRequests, createRequest, approveRequest, rejectRequest } from "../../controllers/request/requestController";
import { authMiddleware } from "../../middleware/auth";
import { authenticateAdmin } from "../../middleware/authenticateAdmin";
import multer from "multer";
import path from "path";

// Configure multer for image uploads
const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads'),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

const requestRouter = Router();

// Apply auth middleware to all routes
requestRouter.use(authMiddleware);


requestRouter.post('/', upload.single('personImage'), createRequest);
requestRouter.get('/', getAllRequests);


requestRouter.put('/:id/approve', authenticateAdmin, approveRequest);
requestRouter.put('/:id/reject', authenticateAdmin, rejectRequest);

export default requestRouter;