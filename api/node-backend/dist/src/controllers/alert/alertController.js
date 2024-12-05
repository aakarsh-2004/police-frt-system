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
exports.getAlerts = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const getAlerts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        // Get total count for pagination
        const totalAlerts = yield prisma_1.prisma.recognizedPerson.count({
            where: {
            // Add filters if needed
            }
        });
        const alerts = yield prisma_1.prisma.recognizedPerson.findMany({
            skip,
            take: pageSize,
            orderBy: {
                capturedDateTime: 'desc'
            },
            include: {
                person: {
                    select: {
                        firstName: true,
                        lastName: true,
                        type: true,
                        suspect: true,
                        missingPerson: true,
                        personImageUrl: true
                    }
                },
                camera: {
                    select: {
                        location: true
                    }
                }
            }
        });
        res.status(200).json({
            message: "Alerts fetched successfully",
            data: alerts,
            total: totalAlerts,
            page,
            pageSize,
            totalPages: Math.ceil(totalAlerts / pageSize)
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching alerts: " + error));
    }
});
exports.getAlerts = getAlerts;
