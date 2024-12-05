import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";
import createHttpError from "http-errors";

export const getRecognitionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isPreviousPeriod = req.query.period === 'previous';
        const today = new Date();
        const dateRange = {
            gte: startOfDay(isPreviousPeriod ? subDays(today, 1) : today),
            lt: endOfDay(isPreviousPeriod ? today : today)
        };

        const [totalDetections, successfulMatches] = await Promise.all([
            prisma.recognizedPerson.count({
                where: {
                    capturedDateTime: dateRange
                }
            }),
            prisma.recognizedPerson.count({
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
    } catch (error) {
        next(createHttpError(500, "Error fetching recognition stats: " + error));
    }
};

export const getPersonStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isPreviousPeriod = req.query.period === 'previous';
        const today = new Date();
        const dateRange = {
            gte: startOfDay(isPreviousPeriod ? subDays(today, 1) : today),
            lt: endOfDay(isPreviousPeriod ? today : today)
        };

        const total = await prisma.person.count({
            where: {
                createdAt: dateRange
            }
        });
        
        res.json({
            data: {
                total
            }
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching person stats: " + error));
    }
}; 