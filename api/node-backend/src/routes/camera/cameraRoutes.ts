import { Router } from "express";
import { 
    getAllCameras, 
    getCameraById, 
    getCameraDetections 
} from "../../controllers/camera/cameraController";

const cameraRouter = Router();

cameraRouter.get('/', getAllCameras);
cameraRouter.get('/:id', getCameraById);
cameraRouter.get('/:id/detections', getCameraDetections);

export default cameraRouter; 