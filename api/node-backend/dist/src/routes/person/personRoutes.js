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
    limits: { fileSize: 3e7 }
});
const personRouter = (0, express_1.Router)();
personRouter.get('/search', personController_1.searchPersons);
personRouter.get('/', personController_1.getAllPersons);
personRouter.post('/', auth_1.authMiddleware, upload.fields([
    { name: 'personImageUrl', maxCount: 1 }
]), personController_1.createPerson);
personRouter.get('/:id', personController_1.getPersonById);
personRouter.put('/:id', upload.fields([
    { name: 'personImageUrl', maxCount: 1 }
]), personController_1.updatePerson);
personRouter.put('/:id/resolve', personController_1.resolvePerson);
personRouter.delete('/:id', personController_1.deletePerson);
exports.default = personRouter;
