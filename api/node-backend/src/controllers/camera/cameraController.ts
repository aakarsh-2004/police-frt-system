import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";

export const getAllCameras = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cameras = await prisma.camera.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        res.json(cameras);
    } catch (error) {
        next(createHttpError(500, "Error fetching cameras: " + error));
    }
};

export const getCameraById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const camera = await prisma.camera.findUnique({
            where: { id },
            include: {
                recognizedPersons: {
                    include: {
                        person: {
                            include: {
                                suspect: true,
                                missingPerson: true
                            }
                        }
                    },
                    orderBy: {
                        capturedDateTime: 'desc'
                    },
                    take: 5
                },
                _count: {
                    select: {
                        recognizedPersons: true
                    }
                }
            }
        });
        

        if (!camera) {
            throw createHttpError(404, "Camera not found");
        }

        const stats = {
            totalDetections: camera._count.recognizedPersons,
            suspects: camera.recognizedPersons.filter(rp => rp.person.type === 'suspect').length,
            missingPersons: camera.recognizedPersons.filter(rp => rp.person.type === 'missing-person').length,
            recentDetections: camera.recognizedPersons.map(rp => ({
                id: rp.id,
                personName: `${rp.person.firstName} ${rp.person.lastName}`,
                personType: rp.person.type,
                capturedImageUrl: rp.capturedImageUrl,
                capturedDateTime: rp.capturedDateTime,
                confidenceScore: rp.confidenceScore
            }))
        };

        res.json({
            ...camera,
            stats
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching camera: " + error));
    }
};

export const createCamera = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, location, latitude, longitude, streamUrl } = req.body;

        const camera = await prisma.camera.create({
            data: {
                name,
                location,
                latitude,
                longitude,
                streamUrl,
                status: 'active'
            }
        });

        res.status(201).json(camera);
    } catch (error) {
        next(createHttpError(500, "Error creating camera: " + error));
    }
};

export const updateCamera = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, location, latitude, longitude, streamUrl, status } = req.body;

        const camera = await prisma.camera.update({
            where: { id },
            data: {
                name,
                location,
                latitude,
                longitude,
                streamUrl,
                status
            }
        });

        res.json(camera);
    } catch (error) {
        next(createHttpError(500, "Error updating camera: " + error));
    }
};

export const deleteCamera = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await prisma.camera.delete({
            where: { id }
        });

        res.json({ message: "Camera deleted successfully" });
    } catch (error) {
        next(createHttpError(500, "Error deleting camera: " + error));
    }
};

export const updateCameraStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const camera = await prisma.camera.update({
            where: { id },
            data: { status }
        });

        res.json(camera);
    } catch (error) {
        next(createHttpError(500, "Error updating camera status: " + error));
    }
}; 