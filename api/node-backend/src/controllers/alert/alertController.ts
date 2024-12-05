import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const skip = (page - 1) * pageSize;

        // Get total count for pagination
        const totalAlerts = await prisma.recognizedPerson.count({
            where: {
                // Add filters if needed
            }
        });

        const alerts = await prisma.recognizedPerson.findMany({
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
    } catch (error) {
        next(createHttpError(500, "Error fetching alerts: " + error));
    }
}; 