import { Router } from "express";
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead 
} from "../../controllers/notification/notificationController";
import { authMiddleware } from "../../middleware/auth";

const notificationRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get('/', getNotifications);
notificationRouter.put('/:id/read', markAsRead);
notificationRouter.put('/mark-all-read', markAllAsRead);

export default notificationRouter; 