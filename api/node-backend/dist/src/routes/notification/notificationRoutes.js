"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../../controllers/notification/notificationController");
const auth_1 = require("../../middleware/auth");
const notificationRouter = (0, express_1.Router)();
notificationRouter.use(auth_1.authMiddleware);
notificationRouter.get('/', notificationController_1.getNotifications);
notificationRouter.put('/:id/read', notificationController_1.markAsRead);
notificationRouter.put('/mark-all-read', notificationController_1.markAllAsRead);
exports.default = notificationRouter;
