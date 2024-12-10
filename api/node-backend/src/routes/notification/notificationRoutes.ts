import { Router } from "express";
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    sendWhatsAppNotification 
} from "../../controllers/notification/notificationController";
import { authMiddleware } from "../../middleware/auth";

const notificationRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get('/', getNotifications);
notificationRouter.put('/:id/read', markAsRead);
notificationRouter.put('/mark-all-read', markAllAsRead);
notificationRouter.post('/whatsapp', sendWhatsAppNotification);

export default notificationRouter; 