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
exports.getPersonStats = exports.getRecognitionStats = void 0;
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
