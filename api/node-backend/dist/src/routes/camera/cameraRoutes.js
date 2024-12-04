"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cameraController_1 = require("../../controllers/camera/cameraController");
const auth_1 = require("../../middleware/auth");
const cameraRouter = (0, express_1.Router)();
// Public routes
cameraRouter.get('/', cameraController_1.getAllCameras);
cameraRouter.get('/:id', cameraController_1.getCameraById);
// Protected routes
cameraRouter.use(auth_1.authMiddleware);
cameraRouter.post('/', cameraController_1.createCamera);
cameraRouter.put('/:id', cameraController_1.updateCamera);
cameraRouter.delete('/:id', cameraController_1.deleteCamera);
cameraRouter.patch('/:id/status', cameraController_1.updateCameraStatus);
exports.default = cameraRouter;
