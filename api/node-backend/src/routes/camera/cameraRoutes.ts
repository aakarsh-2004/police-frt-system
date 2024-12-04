import { Router } from "express";
import { 
    getAllCameras, 
    getCameraById, 
    createCamera, 
    updateCamera, 
    deleteCamera,
    updateCameraStatus
} from "../../controllers/camera/cameraController";
import { authMiddleware } from "../../middleware/auth";

const cameraRouter = Router();

// Public routes
cameraRouter.get('/', getAllCameras);
cameraRouter.get('/:id', getCameraById);

// Protected routes
cameraRouter.use(authMiddleware);
cameraRouter.post('/', createCamera);
cameraRouter.put('/:id', updateCamera);
cameraRouter.delete('/:id', deleteCamera);
cameraRouter.patch('/:id/status', updateCameraStatus);

export default cameraRouter; 