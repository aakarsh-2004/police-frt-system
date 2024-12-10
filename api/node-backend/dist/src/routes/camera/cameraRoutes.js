"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cameraController_1 = require("../../controllers/camera/cameraController");
const cameraRouter = (0, express_1.Router)();
cameraRouter.get('/', cameraController_1.getAllCameras);
cameraRouter.get('/:id', cameraController_1.getCameraById);
cameraRouter.get('/:id/detections', cameraController_1.getCameraDetections);
exports.default = cameraRouter;
