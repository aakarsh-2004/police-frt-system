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
exports.updateCameraStatus = exports.deleteCamera = exports.updateCamera = exports.createCamera = exports.getCameraById = exports.getAllCameras = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const getAllCameras = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cameras = yield prisma_1.prisma.camera.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json(cameras);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching cameras: " + error));
    }
});
exports.getAllCameras = getAllCameras;
const getCameraById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const camera = yield prisma_1.prisma.camera.findUnique({
            where: { id },
            include: {
                recognizedPersons: {
                    include: {
                        person: {
                            include: {
                                suspect: true,
                                missingPerson: true
                            }
                        }
                    },
                    orderBy: {
                        capturedDateTime: 'desc'
                    },
                    take: 5
                },
                _count: {
                    select: {
                        recognizedPersons: true
                    }
                }
            }
        });
        console.log("camera", camera);
        if (!camera) {
            throw (0, http_errors_1.default)(404, "Camera not found");
        }
        const stats = {
            totalDetections: camera._count.recognizedPersons,
            suspects: camera.recognizedPersons.filter(rp => rp.person.type === 'suspect').length,
            missingPersons: camera.recognizedPersons.filter(rp => rp.person.type === 'missing-person').length,
            recentDetections: camera.recognizedPersons.map(rp => ({
                id: rp.id,
                personName: `${rp.person.firstName} ${rp.person.lastName}`,
                personType: rp.person.type,
                capturedImageUrl: rp.capturedImageUrl,
                capturedDateTime: rp.capturedDateTime,
                confidenceScore: rp.confidenceScore
            }))
        };
        res.json(Object.assign(Object.assign({}, camera), { stats }));
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching camera: " + error));
    }
});
exports.getCameraById = getCameraById;
const createCamera = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, latitude, longitude, streamUrl } = req.body;
        const camera = yield prisma_1.prisma.camera.create({
            data: {
                name,
                location,
                latitude,
                longitude,
                streamUrl,
                status: 'active'
            }
        });
        res.status(201).json(camera);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error creating camera: " + error));
    }
});
exports.createCamera = createCamera;
const updateCamera = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, location, latitude, longitude, streamUrl, status } = req.body;
        const camera = yield prisma_1.prisma.camera.update({
            where: { id },
            data: {
                name,
                location,
                latitude,
                longitude,
                streamUrl,
                status
            }
        });
        res.json(camera);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error updating camera: " + error));
    }
});
exports.updateCamera = updateCamera;
const deleteCamera = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma_1.prisma.camera.delete({
            where: { id }
        });
        res.json({ message: "Camera deleted successfully" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error deleting camera: " + error));
    }
});
exports.deleteCamera = deleteCamera;
const updateCameraStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const camera = yield prisma_1.prisma.camera.update({
            where: { id },
            data: { status }
        });
        res.json(camera);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error updating camera status: " + error));
    }
});
exports.updateCameraStatus = updateCameraStatus;
