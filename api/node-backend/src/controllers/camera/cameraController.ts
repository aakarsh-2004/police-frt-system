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
                    }
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

export const getCameraDetections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Get all recognitions with related data
        const recognitions = await prisma.recognizedPerson.findMany({
            where: { cameraId: id },
            include: {
                person: {
                    include: {
                        suspect: true,
                        missingPerson: true
                    }
                },
                camera: true
            },
            orderBy: { capturedDateTime: 'desc' }
        });

        // Format recent detections for the slider
        const recentDetections = recognitions.slice(0, 10).map(recognition => ({
            id: recognition.id,
            personName: `${recognition.person.firstName} ${recognition.person.lastName}`,
            personType: recognition.person.type,
            personImageUrl: recognition.person.personImageUrl,
            capturedImageUrl: recognition.capturedImageUrl,
            capturedDateTime: recognition.capturedDateTime,
            confidenceScore: recognition.confidenceScore,
            location: recognition.camera.location
        }));

        // Get unique persons with their latest detections
        const uniquePersonsMap = new Map();
        recognitions.forEach(recognition => {
            const person = recognition.person;
            const existingPerson = uniquePersonsMap.get(person.id);

            if (!existingPerson || new Date(recognition.capturedDateTime) > new Date(existingPerson.capturedDateTime)) {
                uniquePersonsMap.set(person.id, {
                    id: person.id,
                    firstName: person.firstName,
                    lastName: person.lastName,
                    age: person.age,
                    type: person.type,
                    personImageUrl: person.personImageUrl,
                    gender: person.gender,
                    nationality: person.nationality,
                    capturedImageUrl: recognition.capturedImageUrl,
                    capturedDateTime: recognition.capturedDateTime,
                    confidenceScore: recognition.confidenceScore,
                    location: recognition.camera.location,
                    riskLevel: person.suspect?.riskLevel,
                    foundStatus: person.suspect?.foundStatus || person.missingPerson?.foundStatus,
                    lastSeenDate: person.missingPerson?.lastSeenDate,
                    lastSeenLocation: person.missingPerson?.lastSeenLocation
                });
            }
        });

        // Get total detections for each person
        const detectedPersons = await Promise.all(
            Array.from(uniquePersonsMap.entries()).map(async ([personId, personData]) => {
                const totalDetections = await prisma.recognizedPerson.count({
                    where: {
                        personId: personId,
                        cameraId: id
                    }
                });

                return {
                    ...personData,
                    totalDetections
                };
            })
        );

        // Prepare stats
        const stats = {
            totalDetections: recognitions.length,
            suspects: detectedPersons.filter(p => p.type === 'suspect').length,
            missingPersons: detectedPersons.filter(p => p.type === 'missing-person').length,
            recentDetections
        };

        console.log('API Response:', {
            detectedPersons,
            stats
        });

        res.json({
            message: "Camera detections fetched successfully",
            data: detectedPersons,
            stats
        });

    } catch (error) {
        console.error('Error in getCameraDetections:', error);
        next(createHttpError(500, "Error fetching camera detections: " + error));
    }
};