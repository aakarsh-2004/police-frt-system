import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import fs from "fs";
import { subSeconds } from "date-fns";
import { Parser } from 'json2csv';

export const getRecentRecognitions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recognitions = await prisma.recognizedPerson.findMany({
            take: 5,
            orderBy: {
                capturedDateTime: 'desc'
            },
            include: {
                person: {
                    include: {
                        suspect: true,
                        missingPerson: true
                    }
                },
                camera: true
            }
        });

        res.json({
            message: "Recent recognitions fetched successfully",
            data: recognitions
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching recognitions: " + error));
    }
};

export const addRecognition = async (req: Request, res: Response, next: NextFunction) => {
    const {
        personId,
        capturedLocation,
        capturedDateTime,
        cameraId,
        type,
        confidenceScore
    } = req.body;

    const file = req.file;
    if (!file) {
        return next(createHttpError(400, "No image file provided"));
    }

    try {
        // Parse the date correctly
        let parsedDateTime;
        try {
            // Assuming capturedDateTime is in format "YYYY-MM-DD HH:mm:ss"
            const [datePart, timePart] = capturedDateTime.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes, seconds] = timePart.split(':');
            
            parsedDateTime = new Date(
                parseInt(year),
                parseInt(month) - 1, // Month is 0-based
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            );

            if (isNaN(parsedDateTime.getTime())) {
                throw new Error('Invalid date');
            }
        } catch (error) {
            throw createHttpError(400, "Invalid date format. Expected YYYY-MM-DD HH:mm:ss");
        }

        const recentDetection = await prisma.recognizedPerson.findFirst({
            where: {
                personId,
                cameraId,
                capturedDateTime: {
                    gte: subSeconds(new Date(), 5) 
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });

        if (recentDetection) {
            fs.unlinkSync(file.path);
            
            return res.status(200).json({
                message: "Recent detection exists, skipping duplicate",
                data: recentDetection
            });
        }

        const person = await prisma.person.findUnique({
            where: { id: personId },
            include: {
                suspect: true,
                missingPerson: true
            }
        });

        if (!person) {
            throw createHttpError(404, "Person not found");
        }

        const imageUrl = await cloudinary.uploader.upload(file.path, {
            folder: 'recognitions'
        });

        const recognition = await prisma.recognizedPerson.create({
            data: {
                personId,
                capturedImageUrl: imageUrl.secure_url,
                capturedLocation,
                capturedDateTime: parsedDateTime,
                cameraId,
                type: person.type,
                confidenceScore: confidenceScore.toString()
            },
            include: {
                person: true,
                camera: true
            }
        });

        fs.unlinkSync(file.path);

        res.status(201).json({
            message: "Recognition saved successfully",
            data: recognition
        });
    } catch (error) {
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        next(createHttpError(500, "Error saving recognition: " + error));
    }
};

export const getAllRecognitionsForReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recognitions = await prisma.recognizedPerson.findMany({
            include: {
                person: {
                    select: {
                        firstName: true,
                        lastName: true,
                        type: true,
                        suspect: {
                            select: {
                                riskLevel: true
                            }
                        }
                    }
                },
                camera: {
                    select: {
                        location: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });

        // Format data for CSV
        const fields = [
            'Person Name',
            'Person Type',
            'Risk Level',
            'Location',
            'Detection Time',
            'Confidence Score'
        ];

        const data = recognitions.map(rec => ({
            'Person Name': `${rec.person.firstName} ${rec.person.lastName}`,
            'Person Type': rec.person.type,
            'Risk Level': rec.person.suspect?.riskLevel || 'N/A',
            'Location': rec.camera.location,
            'Detection Time': new Date(rec.capturedDateTime).toLocaleString(),
            'Confidence Score': `${rec.confidenceScore}%`
        }));

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        res.attachment('detections_report.csv');
        res.send(csv);

    } catch (error) {
        next(createHttpError(500, "Error generating report: " + error));
    }
};

export const getRecognitionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get total detections
        const totalDetections = await prisma.recognizedPerson.count();

        // Get successful matches (confidence > 75%)
        const successfulMatches = await prisma.recognizedPerson.count({
            where: {
                confidenceScore: {
                    gte: '50'
                }
            }
        });

        // Calculate average confidence
        const allRecognitions = await prisma.recognizedPerson.findMany({
            select: {
                confidenceScore: true
            }
        });

        const averageConfidence = allRecognitions.length > 0
            ? allRecognitions.reduce((acc, curr) => acc + parseFloat(curr.confidenceScore), 0) / allRecognitions.length
            : 0;

        res.json({
            message: "Stats fetched successfully",
            data: {
                totalDetections,
                successfulMatches,
                averageConfidence: parseFloat(averageConfidence.toFixed(1))
            }
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching recognition stats: " + error));
    }
}; 