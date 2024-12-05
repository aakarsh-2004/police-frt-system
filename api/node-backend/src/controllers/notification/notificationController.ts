import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Mark which notifications are read by this user
        const processedNotifications = notifications.map(notification => ({
            ...notification,
            isRead: notification.readBy.includes(userId || '')
        }));

        res.json({
            message: "Notifications fetched successfully",
            data: processedNotifications
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

        await prisma.notification.update({
            where: { id },
            data: {
                readBy: {
                    push: userId
                }
            }
        });

        res.json({ message: "Notification marked as read" });
    } catch (error) {
        next(createHttpError(500, "Error marking notification as read: " + error));
    }
};

export const createNotification = async (message: string, type: string) => {
    try {
        await prisma.notification.create({
            data: {
                message,
                type,
                readBy: []
            }
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}; 