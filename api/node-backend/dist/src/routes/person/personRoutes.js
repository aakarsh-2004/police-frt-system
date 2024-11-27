"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personController_1 = require("../../controllers/person/personController");
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    dest: node_path_1.default.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 } // 30mb
});
const personRouter = (0, express_1.Router)();
personRouter.get('/', personController_1.getAllPersons);
personRouter.get('/:id', personController_1.getPersonById);
personRouter.post('/', upload.fields([
    { name: 'personImageUrl', maxCount: 1 }
]), personController_1.createPerson);
personRouter.put('/:id', upload.fields([
    { name: 'personImageUrl', maxCount: 1 }
]), personController_1.updatePerson);
personRouter.delete('/:id', personController_1.deletePerson);
exports.default = personRouter;
