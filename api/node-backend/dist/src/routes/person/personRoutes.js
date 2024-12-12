"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personController_1 = require("../../controllers/person/personController");
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../../middleware/auth");
const upload = (0, multer_1.default)({
    dest: node_path_1.default.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const personRouter = (0, express_1.Router)();
// Public routes
personRouter.get('/stats', personController_1.getPersonStats);
personRouter.get('/search', personController_1.searchPersons);
personRouter.get('/', personController_1.getAllPersons);
personRouter.get('/:id', personController_1.getPersonById);
personRouter.get('/:id/locations', personController_1.getPersonLocationStats);
personRouter.get('/:personId/cameras', personController_1.getPersonCameraLocations);
personRouter.get('/:personId/movement-flow', personController_1.getPersonMovementFlow);
// Protected routes
personRouter.use(auth_1.authMiddleware);
personRouter.post('/', upload.single('personImage'), // Match the field name with frontend
personController_1.createPerson);
personRouter.put('/:id', upload.single('personImage'), personController_1.updatePerson);
personRouter.delete('/:id', personController_1.deletePerson);
exports.default = personRouter;
