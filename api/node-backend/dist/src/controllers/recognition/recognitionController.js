"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRecognition = exports.getRecentRecognitions = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const getRecentRecognitions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            take: 5,
            orderBy: {
                capturedDateTime: 'desc'
            },
            include: {
                person: true,
                camera: true
            }
        });
        res.json({
            message: "Recent recognitions fetched successfully",
            data: recognitions
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching recognitions: " + error));
    }
});
exports.getRecentRecognitions = getRecentRecognitions;
const addRecognition = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { personId, capturedLocation, capturedDateTime, cameraId, type, confidenceScore } = req.body;
    const file = req.file;
    if (!file) {
        return next((0, http_errors_1.default)(400, "No image file provided"));
    }
    try {
        const result = yield prisma_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Upload image to cloudinary
            const imageUrl = yield cloudinary_1.default.uploader.upload(file.path, {
                folder: 'recognitions'
            });
            // Create recognition record
            const recognition = yield prisma.recognizedPerson.create({
                data: {
                    personId,
                    capturedImageUrl: imageUrl.secure_url,
                    capturedLocation,
                    capturedDateTime: new Date(capturedDateTime),
                    cameraId,
                    type,
                    confidenceScore: confidenceScore.toString()
                }
            });
            // Clean up the temporary file
            fs_1.default.unlinkSync(file.path);
            return recognition;
        }));
        res.status(201).json({
            message: "Recognition saved successfully",
            data: result
        });
    }
    catch (error) {
        // Clean up the temporary file in case of error
        if (file && fs_1.default.existsSync(file.path)) {
            fs_1.default.unlinkSync(file.path);
        }
        next((0, http_errors_1.default)(500, "Error saving recognition: " + error));
    }
});
exports.addRecognition = addRecognition;
