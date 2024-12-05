import { Router } from "express";
import { getNotifications, markAsRead } from "../../controllers/notification/notificationController";
import { authMiddleware } from "../../middleware/auth";

const notificationRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get('/', getNotifications);
notificationRouter.put('/:id/read', markAsRead);

export default notificationRouter; 