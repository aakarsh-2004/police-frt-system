import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import fs from "fs";
import { subSeconds } from "date-fns";
import { Parser } from 'json2csv';
import nodemailer from 'nodemailer';

export const getRecentRecognitions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recentDetections = await prisma.recognizedPerson.findMany({
            take: 10,
            orderBy: {
                capturedDateTime: 'desc'
            },
            include: {
                person: true,
                camera: true
            }
        });

        const formattedDetections = recentDetections.map(detection => ({
            id: detection.id,
            capturedDateTime: detection.capturedDateTime.toISOString(),
            confidenceScore: detection.confidenceScore,
            capturedImageUrl: detection.capturedImageUrl,
            person: {
                id: detection.person.id,
                firstName: detection.person.firstName,
                lastName: detection.person.lastName,
                personImageUrl: detection.person.personImageUrl,
                type: detection.person.type
            },
            camera: {
                name: detection.camera.name,
                location: detection.camera.location
            }
        }));

        res.json({
            message: "Recent recognitions fetched successfully",
            data: formattedDetections
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
        let parsedDateTime;
        try {
            const [datePart, timePart] = capturedDateTime.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes, seconds] = timePart.split(':');
            
            parsedDateTime = new Date(
                parseInt(year),
                parseInt(month) - 1,
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
        const recognitions = await prisma.recognizedPerson.findMany({
            include: {
                person: {
                    select: {
                        type: true
                    }
                },
                camera: {
                    select: {
                        location: true,
                        name: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTrends = await prisma.recognizedPerson.groupBy({
            by: ['capturedDateTime'],
            where: {
                capturedDateTime: {
                    gte: sevenDaysAgo
                }
            },
            _count: {
                id: true
            }
        });

        const dailyStats = dailyTrends.map(day => ({
            date: new Date(day.capturedDateTime).toISOString().split('T')[0],
            count: day._count.id
        }));

        const typeStats = recognitions.reduce((acc: Record<string, number>, curr) => {
            const type = curr.person.type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const locationMap = new Map<string, {
            location: string;
            cameraName: string;
            detectionCount: number;
        }>();

        recognitions.forEach(rec => {
            const location = rec.camera.location;
            const current = locationMap.get(location);
            
            if (current) {
                current.detectionCount += 1;
            } else {
                locationMap.set(location, {
                    location: rec.camera.location,
                    cameraName: rec.camera.name,
                    detectionCount: 1
                });
            }
        });

        const locationStats = Array.from(locationMap.values())
            .sort((a, b) => b.detectionCount - a.detectionCount)
            .slice(0, 5); 

        const totalDetections = recognitions.length;
        const typeBreakdown = Object.entries(typeStats).map(([type, count]) => ({
            type,
            count,
            percentage: Math.round((count / totalDetections) * 100)
        }));

        const successfulMatches = await prisma.recognizedPerson.count({
            where: {
                confidenceScore: {
                    gte: "50"
                }
            }
        });

        res.json({
            message: "Recognition stats retrieved successfully",
            data: {
                totalDetections,
                successfulMatches,
                byType: typeBreakdown,
                topLocations: locationStats.map(loc => ({
                    location: loc.location,
                    cameraName: loc.cameraName,
                    count: loc.detectionCount,
                    percentage: Math.round((loc.detectionCount / totalDetections) * 100)
                })),
                dailyStats: dailyStats
            }
        });

    } catch (error) {
        console.error('Error in getRecognitionStats:', error);
        next(createHttpError(500, "Error getting recognition stats"));
    }
};

export const shareDetection = async (req: Request, res: Response, next: NextFunction) => {
    const { to, personName, location, time, storedImage, capturedImage } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `Detection Alert: ${personName}`,
            html: `
                <h2>Detection Alert</h2>
                <p><strong>${personName}</strong> was detected at <strong>${location}</strong> on ${time}</p>
                <div style="margin: 20px 0;">
                    <div style="margin-bottom: 10px;">
                        <p style="margin-bottom: 5px;"><strong>Stored Image:</strong></p>
                        <img src="${storedImage}" alt="Stored Image" style="max-width: 300px; border-radius: 4px;">
                    </div>
                    <div>
                        <p style="margin-bottom: 5px;"><strong>Detection Capture:</strong></p>
                        <img src="${capturedImage}" alt="Detection Capture" style="max-width: 300px; border-radius: 4px;">
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Detection shared successfully' });
    } catch (error) {
        next(createHttpError(500, "Error sharing detection: " + error));
    }
};

export const getDetectionsByLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recognitions = await prisma.recognizedPerson.findMany({
            include: {
                camera: {
                    select: {
                        location: true
                    }
                }
            }
        });

        const locationMap = new Map<string, number>();
        
        recognitions.forEach(recognition => {
            const location = recognition.camera?.location || 'Unknown';
            locationMap.set(location, (locationMap.get(location) || 0) + 1);
        });

        const formattedStats = Array.from(locationMap.entries()).map(([location, count]) => ({
            location,
            count
        }));

        formattedStats.sort((a, b) => b.count - a.count);

        res.json({
            message: "Location stats fetched successfully",
            data: formattedStats
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching location stats: " + error));
    }
};

export const getDetectionDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { imageUrl } = req.query;
        console.log("Finding detection with:", { imageUrl });

        if (!imageUrl) {
            return next(createHttpError(400, "Image URL is required"));
        }

        const detection = await prisma.recognizedPerson.findFirst({
            where: {
                capturedImageUrl: imageUrl as string
            },
            include: {
                person: {
                    select: {
                        firstName: true,
                        lastName: true,
                        personImageUrl: true,
                    }
                },
                camera: {
                    select: {
                        location: true
                    }
                }
            }
        });

        console.log("Found detection:", detection);

        if (!detection) {
            console.log("No detection found with URL:", imageUrl);
            return next(createHttpError(404, "Detection not found"));
        }

        res.json({
            message: "Detection details fetched successfully",
            data: {
                id: detection.id,
                capturedImageUrl: detection.capturedImageUrl,
                capturedLocation: detection.camera?.location || 'Unknown',
                capturedDateTime: detection.capturedDateTime,
                confidenceScore: detection.confidenceScore,
                person: {
                    firstName: detection.person.firstName,
                    lastName: detection.person.lastName,
                    personImageUrl: detection.person.personImageUrl
                }
            }
        });
    } catch (error) {
        console.error("Error in getDetectionDetails:", error);
        next(createHttpError(500, "Error fetching detection details: " + error));
    }
}; 