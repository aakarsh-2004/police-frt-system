import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { subMinutes } from "date-fns";
import createHttpError from "http-errors";

export const getRecognitionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const total = await prisma.recognizedPerson.count();
        
        const recentAlerts = await prisma.recognizedPerson.count({
            where: {
                capturedDateTime: {
                    gte: subMinutes(new Date(), 30)
                }
            }
        });

        res.json({
            total,
            recentAlerts
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching recognition stats: " + error));
    }
};

export const getPersonStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const total = await prisma.person.count();
        
        res.json({
            total
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching person stats: " + error));
    }
}; 