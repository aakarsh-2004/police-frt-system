"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recognitionController_1 = require("../../controllers/recognition/recognitionController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    dest: path_1.default.resolve(__dirname, '../../../public/uploads')
});
const recognitionRouter = (0, express_1.Router)();
recognitionRouter.get('/recent', recognitionController_1.getRecentRecognitions);
recognitionRouter.post('/', upload.single('capturedImage'), recognitionController_1.addRecognition);
exports.default = recognitionRouter;
