import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import fs from "fs";
import { subSeconds } from "date-fns";

export const getRecentRecognitions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recognitions = await prisma.recognizedPerson.findMany({
            take: 5,
            orderBy: {
                capturedDateTime: 'desc'
            },
            include: {
                person: true,
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
                capturedDateTime: new Date(capturedDateTime),
                cameraId,
                type: person.type,
                confidenceScore: confidenceScore.toString()
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