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
exports.getDetectionDetails = exports.getDetectionsByLocation = exports.shareDetection = exports.getRecognitionStats = exports.getAllRecognitionsForReport = exports.addRecognition = exports.getRecentRecognitions = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const date_fns_1 = require("date-fns");
const json2csv_1 = require("json2csv");
const nodemailer_1 = __importDefault(require("nodemailer"));
const getRecentRecognitions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recentDetections = yield prisma_1.prisma.recognizedPerson.findMany({
            take: 10,
            orderBy: {
                capturedDateTime: 'desc'
            },
            include: {
                person: true,
                camera: true
            }
        });
        const formattedDetections = recentDetections.map(detection => ({
            id: detection.id,
            capturedDateTime: detection.capturedDateTime.toISOString(),
            confidenceScore: detection.confidenceScore,
            capturedImageUrl: detection.capturedImageUrl,
            person: {
                id: detection.person.id,
                firstName: detection.person.firstName,
                lastName: detection.person.lastName,
                personImageUrl: detection.person.personImageUrl,
                type: detection.person.type
            },
            camera: {
                name: detection.camera.name,
                location: detection.camera.location
            }
        }));
        res.json({
            message: "Recent recognitions fetched successfully",
            data: formattedDetections
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
        let parsedDateTime;
        try {
            const [datePart, timePart] = capturedDateTime.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes, seconds] = timePart.split(':');
            parsedDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
            if (isNaN(parsedDateTime.getTime())) {
                throw new Error('Invalid date');
            }
        }
        catch (error) {
            throw (0, http_errors_1.default)(400, "Invalid date format. Expected YYYY-MM-DD HH:mm:ss");
        }
        const recentDetection = yield prisma_1.prisma.recognizedPerson.findFirst({
            where: {
                personId,
                cameraId,
                capturedDateTime: {
                    gte: (0, date_fns_1.subSeconds)(new Date(), 5)
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });
        if (recentDetection) {
            fs_1.default.unlinkSync(file.path);
            return res.status(200).json({
                message: "Recent detection exists, skipping duplicate",
                data: recentDetection
            });
        }
        const person = yield prisma_1.prisma.person.findUnique({
            where: { id: personId },
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        if (!person) {
            throw (0, http_errors_1.default)(404, "Person not found");
        }
        const imageUrl = yield cloudinary_1.default.uploader.upload(file.path, {
            folder: 'recognitions'
        });
        const recognition = yield prisma_1.prisma.recognizedPerson.create({
            data: {
                personId,
                capturedImageUrl: imageUrl.secure_url,
                capturedLocation,
                capturedDateTime: parsedDateTime,
                cameraId,
                type: person.type,
                confidenceScore: confidenceScore.toString()
            },
            include: {
                person: true,
                camera: true
            }
        });
        fs_1.default.unlinkSync(file.path);
        res.status(201).json({
            message: "Recognition saved successfully",
            data: recognition
        });
    }
    catch (error) {
        if (file && fs_1.default.existsSync(file.path)) {
            fs_1.default.unlinkSync(file.path);
        }
        next((0, http_errors_1.default)(500, "Error saving recognition: " + error));
    }
});
exports.addRecognition = addRecognition;
const getAllRecognitionsForReport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            include: {
                person: {
                    select: {
                        firstName: true,
                        lastName: true,
                        type: true,
                        suspect: {
                            select: {
                                riskLevel: true
                            }
                        }
                    }
                },
                camera: {
                    select: {
                        location: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });
        const fields = [
            'Person Name',
            'Person Type',
            'Risk Level',
            'Location',
            'Detection Time',
            'Confidence Score'
        ];
        const data = recognitions.map(rec => {
            var _a;
            return ({
                'Person Name': `${rec.person.firstName} ${rec.person.lastName}`,
                'Person Type': rec.person.type,
                'Risk Level': ((_a = rec.person.suspect) === null || _a === void 0 ? void 0 : _a.riskLevel) || 'N/A',
                'Location': rec.camera.location,
                'Detection Time': new Date(rec.capturedDateTime).toLocaleString(),
                'Confidence Score': `${rec.confidenceScore}%`
            });
        });
        const json2csvParser = new json2csv_1.Parser({ fields });
        const csv = json2csvParser.parse(data);
        res.header('Content-Type', 'text/csv');
        res.attachment('detections_report.csv');
        res.send(csv);
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error generating report: " + error));
    }
});
exports.getAllRecognitionsForReport = getAllRecognitionsForReport;
const getRecognitionStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalDetections = yield prisma_1.prisma.recognizedPerson.count();
        const successfulMatches = yield prisma_1.prisma.recognizedPerson.count({
            where: {
                confidenceScore: {
                    gte: '50'
                }
            }
        });
        const allRecognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            select: {
                confidenceScore: true
            }
        });
        const averageConfidence = allRecognitions.length > 0
            ? allRecognitions.reduce((acc, curr) => acc + parseFloat(curr.confidenceScore), 0) / allRecognitions.length
            : 0;
        res.json({
            message: "Stats fetched successfully",
            data: {
                totalDetections,
                successfulMatches,
                averageConfidence: parseFloat(averageConfidence.toFixed(1))
            }
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching recognition stats: " + error));
    }
});
exports.getRecognitionStats = getRecognitionStats;
const shareDetection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, personName, location, time, storedImage, capturedImage } = req.body;
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `Detection Alert: ${personName}`,
            html: `
                <h2>Detection Alert</h2>
                <p><strong>${personName}</strong> was detected at <strong>${location}</strong> on ${time}</p>
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 10px;">
                        <p style="margin-bottom: 5px;"><strong>Stored Image:</strong></p>
                        <img src="${storedImage}" alt="Stored Image" style="max-width: 300px; border-radius: 4px;">
                    </div>
                    <div>
                        <p style="margin-bottom: 5px;"><strong>Detection Capture:</strong></p>
                        <img src="${capturedImage}" alt="Detection Capture" style="max-width: 300px; border-radius: 4px;">
                    </div>
                </div>
            `,
        };
        yield transporter.sendMail(mailOptions);
        res.json({ message: 'Detection shared successfully' });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error sharing detection: " + error));
    }
});
exports.shareDetection = shareDetection;
const getDetectionsByLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            include: {
                camera: {
                    select: {
                        location: true
                    }
                }
            }
        });
        const locationMap = new Map();
        recognitions.forEach(recognition => {
            var _a;
            const location = ((_a = recognition.camera) === null || _a === void 0 ? void 0 : _a.location) || 'Unknown';
            locationMap.set(location, (locationMap.get(location) || 0) + 1);
        });
        const formattedStats = Array.from(locationMap.entries()).map(([location, count]) => ({
            location,
            count
        }));
        formattedStats.sort((a, b) => b.count - a.count);
        res.json({
            message: "Location stats fetched successfully",
            data: formattedStats
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching location stats: " + error));
    }
});
exports.getDetectionsByLocation = getDetectionsByLocation;
const getDetectionDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { imageUrl, personId } = req.query;
        console.log("Finding detection with:", { imageUrl, personId });
        if (!imageUrl || !personId) {
            return next((0, http_errors_1.default)(400, "Image URL and Person ID are required"));
        }
        const detection = yield prisma_1.prisma.recognizedPerson.findFirst({
            where: {
                AND: [
                    { capturedImageUrl: imageUrl },
                    { personId: personId }
                ]
            },
            include: {
                person: {
                    select: {
                        firstName: true,
                        lastName: true,
                        personImageUrl: true,
                    }
                },
                camera: {
                    select: {
                        location: true
                    }
                }
            }
        });
        console.log("Found detection:", detection);
        if (!detection) {
            console.log("No detection found with URL:", imageUrl);
            return next((0, http_errors_1.default)(404, "Detection not found"));
        }
        res.json({
            message: "Detection details fetched successfully",
            data: {
                id: detection.id,
                capturedImageUrl: detection.capturedImageUrl,
                capturedLocation: ((_a = detection.camera) === null || _a === void 0 ? void 0 : _a.location) || 'Unknown',
                capturedDateTime: detection.capturedDateTime,
                confidenceScore: detection.confidenceScore,
                person: {
                    firstName: detection.person.firstName,
                    lastName: detection.person.lastName,
                    personImageUrl: detection.person.personImageUrl
                }
            }
        });
    }
    catch (error) {
        console.error("Error in getDetectionDetails:", error);
        next((0, http_errors_1.default)(500, "Error fetching detection details: " + error));
    }
});
exports.getDetectionDetails = getDetectionDetails;
