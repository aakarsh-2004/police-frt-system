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
exports.getCameraDetections = exports.updateCameraStatus = exports.deleteCamera = exports.updateCamera = exports.createCamera = exports.getCameraById = exports.getAllCameras = void 0;
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
                    }
                },
                _count: {
                    select: {
                        recognizedPersons: true
                    }
                }
            }
        });
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
const getCameraDetections = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get all recognitions with related data
        const recognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            where: { cameraId: id },
            include: {
                person: {
                    include: {
                        suspect: true,
                        missingPerson: true
                    }
                },
                camera: true
            },
            orderBy: { capturedDateTime: 'desc' }
        });
        // Format recent detections for the slider
        const recentDetections = recognitions.slice(0, 10).map(recognition => ({
            id: recognition.id,
            personName: `${recognition.person.firstName} ${recognition.person.lastName}`,
            personType: recognition.person.type,
            personImageUrl: recognition.person.personImageUrl,
            capturedImageUrl: recognition.capturedImageUrl,
            capturedDateTime: recognition.capturedDateTime,
            confidenceScore: recognition.confidenceScore,
            location: recognition.camera.location
        }));
        // Get unique persons with their latest detections
        const uniquePersonsMap = new Map();
        recognitions.forEach(recognition => {
            var _a, _b, _c, _d, _e;
            const person = recognition.person;
            const existingPerson = uniquePersonsMap.get(person.id);
            if (!existingPerson || new Date(recognition.capturedDateTime) > new Date(existingPerson.capturedDateTime)) {
                uniquePersonsMap.set(person.id, {
                    id: person.id,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    age: person.age,
                    type: person.type,
                    personImageUrl: person.personImageUrl,
                    gender: person.gender,
                    nationality: person.nationality,
                    capturedImageUrl: recognition.capturedImageUrl,
                    capturedDateTime: recognition.capturedDateTime,
                    confidenceScore: recognition.confidenceScore,
                    location: recognition.camera.location,
                    riskLevel: (_a = person.suspect) === null || _a === void 0 ? void 0 : _a.riskLevel,
                    foundStatus: ((_b = person.suspect) === null || _b === void 0 ? void 0 : _b.foundStatus) || ((_c = person.missingPerson) === null || _c === void 0 ? void 0 : _c.foundStatus),
                    lastSeenDate: (_d = person.missingPerson) === null || _d === void 0 ? void 0 : _d.lastSeenDate,
                    lastSeenLocation: (_e = person.missingPerson) === null || _e === void 0 ? void 0 : _e.lastSeenLocation
                });
            }
        });
        // Get total detections for each person
        const detectedPersons = yield Promise.all(Array.from(uniquePersonsMap.entries()).map((_a) => __awaiter(void 0, [_a], void 0, function* ([personId, personData]) {
            const totalDetections = yield prisma_1.prisma.recognizedPerson.count({
                where: {
                    personId: personId,
                    cameraId: id
                }
            });
            return Object.assign(Object.assign({}, personData), { totalDetections });
        })));
        // Prepare stats
        const stats = {
            totalDetections: recognitions.length,
            suspects: detectedPersons.filter(p => p.type === 'suspect').length,
            missingPersons: detectedPersons.filter(p => p.type === 'missing-person').length,
            recentDetections
        };
        console.log('API Response:', {
            detectedPersons,
            stats
        });
        res.json({
            message: "Camera detections fetched successfully",
            data: detectedPersons,
            stats
        });
    }
    catch (error) {
        console.error('Error in getCameraDetections:', error);
        next((0, http_errors_1.default)(500, "Error fetching camera detections: " + error));
    }
});
exports.getCameraDetections = getCameraDetections;
