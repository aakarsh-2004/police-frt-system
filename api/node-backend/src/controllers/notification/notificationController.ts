import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import axios from "axios";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                NOT: {
                    readBy: {
                        has: userId
                    }
                }
            }
        });

        res.json({
            message: "Notifications fetched successfully",
            data: notifications.map(notification => ({
                ...notification,
                read: notification.readBy.includes(userId || ''),
                createdAt: notification.createdAt.toISOString()
            }))
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching notifications: " + error));
    }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw createHttpError(401, "Unauthorized");
        }

        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            throw createHttpError(404, "Notification not found");
        }

        // Add userId to readBy array if not already present
        const updatedReadBy = [...new Set([...notification.readBy, userId])];

        await prisma.notification.update({
            where: { id },
            data: {
                readBy: updatedReadBy
            }
        });

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        next(createHttpError(500, "Error marking notification as read: " + error));
    }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            throw createHttpError(401, "Unauthorized");
        }

        const notifications = await prisma.notification.findMany({
            where: {
                NOT: {
                    readBy: {
                        has: userId
                    }
                }
            }
        });

        await Promise.all(
            notifications.map(notification => 
                prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        readBy: [...new Set([...notification.readBy, userId])]
                    }
                })
            )
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        next(createHttpError(500, "Error marking all notifications as read: " + error));
    }
};

export type NotificationType = 
    | 'request_approved'
    | 'request_rejected'
    | 'person_deleted'
    | 'user_deleted'
    | 'person_added'
    | 'user_added';

export const createNotification = async (
    message: string,
    type: NotificationType,
    userId?: string
) => {
    try {
        await prisma.notification.create({
            data: {
                message,
                type,
                read: false,
                readBy: userId ? [userId] : []
            }
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export const sendWhatsAppNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phoneNumber, message } = req.body;
        
        // Format phone number
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        // Make request to TextMeBot API
        const response = await axios.get('http://api.textmebot.com/send.php', {
            params: {
                recipient: formattedPhone,
                apikey: 'WP4fS76mtyUw', // Consider moving this to environment variables
                text: message
            }
        });

        res.json({
            success: true,
            message: 'WhatsApp message sent successfully'
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        next(createHttpError(500, "Failed to send WhatsApp message"));
    }
}; 