import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import fs from "fs";

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
        const result = await prisma.$transaction(async (prisma) => {
            // Upload image to cloudinary
            const imageUrl = await cloudinary.uploader.upload(file.path, {
                folder: 'recognitions'
            });

            // Create recognition record
            const recognition = await prisma.recognizedPerson.create({
                data: {
                    personId,
                    capturedImageUrl: imageUrl.secure_url,
                    capturedLocation,
                    capturedDateTime: new Date(capturedDateTime),
                    cameraId,
                    type,
                    confidenceScore: confidenceScore.toString()
                }
            });

            // Clean up the temporary file
            fs.unlinkSync(file.path);

            return recognition;
        });

        res.status(201).json({
            message: "Recognition saved successfully",
            data: result
        });
    } catch (error) {
        // Clean up the temporary file in case of error
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        next(createHttpError(500, "Error saving recognition: " + error));
    }
}; 