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
exports.getDetectionTrends = exports.getPersonStats = exports.getRecognitionStats = void 0;
const prisma_1 = require("../../lib/prisma");
const date_fns_1 = require("date-fns");
const http_errors_1 = __importDefault(require("http-errors"));
const getRecognitionStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isPreviousPeriod = req.query.period === 'previous';
        const today = new Date();
        const dateRange = {
            gte: (0, date_fns_1.startOfDay)(isPreviousPeriod ? (0, date_fns_1.subDays)(today, 1) : today),
            lt: (0, date_fns_1.endOfDay)(isPreviousPeriod ? today : today)
        };
        const [totalDetections, successfulMatches] = yield Promise.all([
            prisma_1.prisma.recognizedPerson.count({
                where: {
                    capturedDateTime: dateRange
                }
            }),
            prisma_1.prisma.recognizedPerson.count({
                where: {
                    capturedDateTime: dateRange,
                    confidenceScore: {
                        gte: '80'
                    }
                }
            })
        ]);
        res.json({
            data: {
                totalDetections,
                successfulMatches
            }
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching recognition stats: " + error));
    }
});
exports.getRecognitionStats = getRecognitionStats;
const getPersonStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isPreviousPeriod = req.query.period === 'previous';
        const today = new Date();
        const dateRange = {
            gte: (0, date_fns_1.startOfDay)(isPreviousPeriod ? (0, date_fns_1.subDays)(today, 1) : today),
            lt: (0, date_fns_1.endOfDay)(isPreviousPeriod ? today : today)
        };
        const total = yield prisma_1.prisma.person.count({
            where: {
                createdAt: dateRange
            }
        });
        res.json({
            data: {
                total
            }
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching person stats: " + error));
    }
});
exports.getPersonStats = getPersonStats;
const getDetectionTrends = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get daily trends for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const daily = yield prisma_1.prisma.recognizedPerson.findMany({
            where: {
                capturedDateTime: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                capturedDateTime: true,
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });
        // Group by type
        const byType = yield prisma_1.prisma.person.groupBy({
            by: ['type'],
            _count: {
                id: true
            }
        });
        // Get top locations
        const byLocation = yield prisma_1.prisma.recognizedPerson.findMany({
            take: 5,
            select: {
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
        // Group by confidence ranges with proper parsing
        const recognitions = yield prisma_1.prisma.recognizedPerson.findMany({
            select: {
                confidenceScore: true
            }
        });
        // Initialize confidence ranges
        const confidenceRanges = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            'Below 60': 0
        };
        // Process each recognition's confidence score
        recognitions.forEach(rec => {
            // Parse the confidence score and handle invalid values
            const confidence = parseFloat(rec.confidenceScore);
            if (isNaN(confidence)) {
                return; // Skip invalid confidence scores
            }
            // Categorize into ranges
            if (confidence >= 90) {
                confidenceRanges['90-100']++;
            }
            else if (confidence >= 80) {
                confidenceRanges['80-89']++;
            }
            else if (confidence >= 70) {
                confidenceRanges['70-79']++;
            }
            else if (confidence >= 60) {
                confidenceRanges['60-69']++;
            }
            else {
                confidenceRanges['Below 60']++;
            }
        });
        // Convert to array format for the chart
        const confidenceData = Object.entries(confidenceRanges)
            .filter(([_, count]) => count > 0) // Only include ranges with data
            .map(([range, count]) => ({
            confidenceScore: range,
            _count: { id: count }
        }))
            .sort((a, b) => {
            // Custom sort to maintain range order
            const getMinValue = (range) => {
                if (range === 'Below 60')
                    return 0;
                return parseInt(range.split('-')[0]);
            };
            return getMinValue(b.confidenceScore) - getMinValue(a.confidenceScore);
        });
        // Group daily detections by date
        const dailyGroups = daily.reduce((acc, curr) => {
            const date = new Date(curr.capturedDateTime).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        // Convert to array format for charts
        const dailyData = Object.entries(dailyGroups).map(([date, count]) => ({
            capturedDateTime: date,
            _count: { id: count }
        }));
        // Format location data
        const locationCounts = byLocation.reduce((acc, curr) => {
            var _a;
            const location = ((_a = curr.camera) === null || _a === void 0 ? void 0 : _a.location) || 'Unknown';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});
        const locationData = Object.entries(locationCounts).map(([location, count]) => ({
            camera: { location },
            _count: { id: count }
        }));
        res.json({
            message: "Detection trends fetched successfully",
            data: {
                daily: dailyData,
                byType,
                byLocation: locationData,
                byConfidence: confidenceData
            }
        });
    }
    catch (error) {
        console.error("Error in getDetectionTrends:", error);
        next((0, http_errors_1.default)(500, "Error fetching detection trends: " + error));
    }
});
exports.getDetectionTrends = getDetectionTrends;
