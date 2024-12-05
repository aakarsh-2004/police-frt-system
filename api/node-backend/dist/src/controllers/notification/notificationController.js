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
exports.createNotification = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = require("../../lib/prisma");
const http_errors_1 = __importDefault(require("http-errors"));
const getNotifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const notifications = yield prisma_1.prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Mark which notifications are read by this user
        const processedNotifications = notifications.map(notification => (Object.assign(Object.assign({}, notification), { isRead: notification.readBy.includes(userId || '') })));
        res.json({
            message: "Notifications fetched successfully",
            data: processedNotifications
        });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error fetching notifications: " + error));
    }
});
exports.getNotifications = getNotifications;
const markAsRead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized");
        }
        yield prisma_1.prisma.notification.update({
            where: { id },
            data: {
                readBy: {
                    push: userId
                }
            }
        });
        res.json({ message: "Notification marked as read" });
    }
    catch (error) {
        next((0, http_errors_1.default)(500, "Error marking notification as read: " + error));
    }
});
exports.markAsRead = markAsRead;
const createNotification = (message, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.prisma.notification.create({
            data: {
                message,
                type,
                readBy: []
            }
        });
    }
    catch (error) {
        console.error("Error creating notification:", error);
    }
});
exports.createNotification = createNotification;
