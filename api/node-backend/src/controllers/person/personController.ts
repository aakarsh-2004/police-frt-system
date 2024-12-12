import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import path from "node:path";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import fs from "node:fs";
import { createNotification } from '../notification/notificationController';
import { AuthRequest } from '../../middleware/auth';

const getAllPersons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const persons = await prisma.person.findMany({
            include: {
                suspect: true,
                missingPerson: true
            }
        });
        res.status(200).json({
            message: "All persons fetched successfully",
            data: persons
        });
    } catch (error) {
        next(createHttpError(500, "Error while fetching all persons " + error));
    }
}

const getPersonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const person = await prisma.person.findUnique({
            where: { id },
            include: {
                suspect: {
                    include: {
                        criminalRecord: true
                    }
                },
                missingPerson: true,
                recognizedPerson: {
                    include: {
                        camera: true,
                        person: {
                            select: {
                                firstName: true,
                                lastName: true,
                                personImageUrl: true
                            }
                        }
                    },
                    orderBy: {
                        capturedDateTime: 'desc'
                    }
                }
            }
        });

        if (!person) {
            return next(createHttpError(404, "Person not found"));
        }

        res.json({
            message: "Person details fetched successfully",
            data: person
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching person details: " + error));
    }
};

const createPerson = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return next(createHttpError(401, "Unauthorized"));
        }

        // If user is not admin, create a request instead
        if (user.role !== 'admin') {
            const requestData = {
                requestedBy: user.id,
                status: 'pending',
                personData: JSON.stringify(req.body),
                imageData: req.file ? JSON.stringify(req.file) : null
            };

            const request = await prisma.requests.create({
                data: requestData,
                include: {
                    user: true
                }
            });

            await createNotification(
                `New person request from ${user.firstName} ${user.lastName}`,
                'request'
            );

            return res.status(201).json({
                message: "Request submitted successfully",
                data: request
            });
        }

        // If user is admin, proceed with direct creation
        const data = req.body;
        const file = req.file || (req.files as any)?.personImageUrl?.[0];

        console.log('Received data:', data);
        console.log('Received files:', file);

        if (!data.firstName || !data.lastName || !data.age || !data.dateOfBirth || !data.type) {
            throw createHttpError(400, "Missing required fields");
        }

        let imageUrl = null;
        if (file) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'person-images'
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(file.path);
        }

        const suspectData = data.suspect ? JSON.parse(data.suspect) : null;
        const missingPersonData = data.missingPerson ? JSON.parse(data.missingPerson) : null;

        const personData: any = {
            firstName: data.firstName,
            lastName: data.lastName,
            age: parseInt(data.age),
            dateOfBirth: new Date(data.dateOfBirth),
            gender: data.gender,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address,
            type: data.type,
            nationality: data.nationality || null,
            nationalId: data.nationalId || null,
            personImageUrl: imageUrl
        };

        if (data.type === 'suspect' && suspectData) {
            personData.suspect = {
                create: {
                    riskLevel: suspectData.riskLevel || 'low',
                    foundStatus: false
                }
            };
        } else if (data.type === 'missing-person' && missingPersonData) {
            const lastSeenDate = new Date(missingPersonData.lastSeenDate);
            if (isNaN(lastSeenDate.getTime())) {
                throw createHttpError(400, "Invalid lastSeenDate");
            }

            personData.missingPerson = {
                create: {
                    lastSeenDate: lastSeenDate,
                    lastSeenLocation: missingPersonData.lastSeenLocation,
                    missingSince: lastSeenDate,
                    foundStatus: false,
                    reportBy: missingPersonData.reportBy
                }
            };
        }

        const person = await prisma.person.create({
            data: personData,
            include: {
                suspect: true,
                missingPerson: true
            }
        });

        await createNotification(
            `New ${data.type} added: ${data.firstName} ${data.lastName}`,
            'PERSON_ADDED'
        );

        res.status(201).json({
            message: "Person created successfully",
            data: person
        });
    } catch (error) {
        console.error('Error creating person:', error);
        next(createHttpError(500, "Error creating person: " + error));
    }
};

const updatePerson = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updates = req.body;
    

    try {
        const person = await prisma.person.findUnique({
            where: { id },
            include: {
                suspect: true,
                missingPerson: true
            }
        });

        if (!person) {
            throw createHttpError(404, "Person not found");
        }
        let imageUrl = person.personImageUrl;
        console.log(files);
        
        if (files && files.personImageUrl && files.personImageUrl[0]) {
            console.log('Updating person image');
            
            if (person.personImageUrl) {
                try {
                    const personSplit = person.personImageUrl.split('/');
                    const lastTwo = personSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const personImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        await cloudinary.uploader.destroy(personImageSplit);
                    }
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }

            const personImageMimeType = files.personImageUrl[0].mimetype.split('/').at(-1);
            const result = await cloudinary.uploader.upload(files.personImageUrl[0].path, {
                folder: 'persons',
                format: personImageMimeType
            });
            imageUrl = result.secure_url;

            fs.unlinkSync(files.personImageUrl[0].path);
        }

        const dateOfBirth = new Date(updates.dateOfBirth).toISOString();

        const updateData = {
            firstName: updates.firstName,
            lastName: updates.lastName,
            age: parseInt(updates.age),
            dateOfBirth,
            address: updates.address,
            ...(imageUrl && { personImageUrl: imageUrl }),
        };

        const updatedPerson = await prisma.person.update({
            where: { id },
            data: {
                ...updateData,
                ...(person.type === 'suspect' && updates.riskLevel && {
                    suspect: {
                        update: {
                            where: { personId: id },
                            data: {
                                riskLevel: updates.riskLevel
                            }
                        }
                    }
                })
            },
            include: {
                suspect: true,
                missingPerson: true
            }
        });

        res.json({
            message: "Person updated successfully",
            data: updatedPerson
        });
    } catch (error) {
        if (files?.personImageUrl?.[0]?.path) {
            fs.unlinkSync(files.personImageUrl[0].path);
        }
        next(createHttpError(500, "Error updating person: " + error));
    }
};

const deletePerson = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const deletedBy = req.user;

    try {
        // Use transaction to ensure all related records are deleted
        await prisma.$transaction(async (tx) => {
            const person = await tx.person.findUnique({
                where: { id },
                include: {
                    suspect: true,
                    missingPerson: true,
                    recognizedPerson: true
                }
            });

            if (!person) {
                throw createHttpError(404, "Person not found");
            }

            // Delete related records first
            if (person.recognizedPerson.length > 0) {
                await tx.recognizedPerson.deleteMany({
                    where: { personId: id }
                });
            }

            if (person.suspect) {
                await tx.suspect.delete({
                    where: { personId: id }
                });
            }

            if (person.missingPerson) {
                await tx.missingPerson.delete({
                    where: { personId: id }
                });
            }

            // Finally delete the person
            await tx.person.delete({
                where: { id }
            });

            // Create notification for person deletion
            await createNotification(
                `${person.type === 'suspect' ? 'Suspect' : 'Missing Person'} ${person.firstName} ${person.lastName} was deleted by ${deletedBy?.firstName} ${deletedBy?.lastName}`,
                'person_deleted'
            );
        });

        res.json({ message: "Person deleted successfully" });
    } catch (error) {
        console.error('Error in deletePerson:', error);
        next(createHttpError(500, "Error deleting person: " + error));
    }
};

const searchPersons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const searchQuery = req.query.q as string || '';
        const locations = req.query.locations ? (req.query.locations as string).split(',') : [];
        const minConfidence = parseFloat(req.query.minConfidence as string) || 0;

        // Base query conditions
        const baseConditions = searchQuery ? {
            OR: [
                { firstName: { contains: searchQuery, mode: 'insensitive' } },
                { lastName: { contains: searchQuery, mode: 'insensitive' } },
                { address: { contains: searchQuery, mode: 'insensitive' } },
                { nationalId: { contains: searchQuery, mode: 'insensitive' } }
            ]
        } : {};

        // Location filter conditions
        const locationConditions = locations.length > 0 ? {
            recognizedPerson: {
                some: {
                    camera: {
                        location: {
                            in: locations
                        }
                    }
                }
            }
        } : {};

        // Confidence filter conditions
        const confidenceConditions = minConfidence > 0 ? {
            recognizedPerson: {
                some: {
                    confidenceScore: {
                        gte: minConfidence.toString()
                    }
                }
            }
        } : {};

        // Combine all conditions
        const whereClause = {
            AND: [
                baseConditions,
                ...(locations.length > 0 ? [locationConditions] : []),
                ...(minConfidence > 0 ? [confidenceConditions] : [])
            ]
        };

        const persons = await prisma.person.findMany({
            where: whereClause,
            include: {
                suspect: true,
                missingPerson: true,
                recognizedPerson: {
                    include: {
                        camera: true
                    },
                    orderBy: {
                        capturedDateTime: 'desc'
                    }
                }
            }
        });

        console.log(`Found ${persons.length} matches`);

        // Post-process results to ensure they match all criteria
        const filteredPersons = persons.filter(person => {
            // If no filters are applied, include all persons
            if (locations.length === 0 && minConfidence === 0) {
                return true;
            }

            // Check if person has any recognitions
            if (person.recognizedPerson.length === 0) {
                return false;
            }

            // Check location filter
            if (locations.length > 0) {
                const hasMatchingLocation = person.recognizedPerson.some(rec => 
                    locations.includes(rec.camera.location)
                );
                if (!hasMatchingLocation) {
                    return false;
                }
            }

            // Check confidence filter
            if (minConfidence > 0) {
                const hasMatchingConfidence = person.recognizedPerson.some(rec => 
                    parseFloat(rec.confidenceScore) >= minConfidence
                );
                if (!hasMatchingConfidence) {
                    return false;
                }
            }

            return true;
        });

        // Add a count of matching detections for each person
        const personsWithMatchCounts = filteredPersons.map(person => ({
            ...person,
            matchCount: person.recognizedPerson.length
        }));

        res.status(200).json({
            message: "Search results fetched successfully",
            data: personsWithMatchCounts,
            totalMatches: personsWithMatchCounts.reduce((acc, p) => acc + p.matchCount, 0)
        });
    } catch (error) {
        console.error("Search error:", error);
        next(createHttpError(500, "Error while searching persons " + error));
    }
};

export const resolvePerson = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { type } = req.body;

    try {
        if (type === 'suspect') {
            await prisma.suspect.update({
                where: { personId: id },
                data: { foundStatus: true }
            });
        } else if (type === 'missing-person') {
            await prisma.missingPerson.update({
                where: { personId: id },
                data: { foundStatus: true }
            });
        }

        res.json({
            message: "Person status updated successfully"
        });
    } catch (error) {
        next(createHttpError(500, "Error updating person status: " + error));
    }
};

export const getPersonStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const total = await prisma.person.count();
        
        res.status(200).json({
            message: "Person stats retrieved successfully",
            data: {
                total
            }
        });
    } catch (error) {
        console.error('Error getting person stats:', error);
        next(createHttpError(500, "Error getting person stats: " + error));
    }
};

export const getPersonLocationStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Get all recognitions for this person with camera details
        const recognitions = await prisma.recognizedPerson.findMany({
            where: {
                personId: id
            },
            select: {
                capturedDateTime: true,
                camera: {
                    select: {
                        id: true,
                        name: true,
                        location: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'desc'
            }
        });

        // Create a Map to store unique locations and their details
        const locationMap = new Map<string, {
            location: string;
            detectionCount: number;
            lastDetected: Date;
        }>();

        // Process recognitions to get unique locations and counts
        recognitions.forEach(recognition => {
            const location = recognition.camera.location;
            const current = locationMap.get(location);
            
            if (current) {
                // Update existing location
                current.detectionCount += 1;
                if (new Date(recognition.capturedDateTime) > current.lastDetected) {
                    current.lastDetected = new Date(recognition.capturedDateTime);
                }
            } else {
                // Add new location
                locationMap.set(location, {
                    location,
                    detectionCount: 1,
                    lastDetected: new Date(recognition.capturedDateTime)
                });
            }
        });

        // Convert Map to array and format the response
        const locationStats = {
            totalLocations: locationMap.size,
            locations: Array.from(locationMap.values()).map(stat => ({
                location: stat.location,
                detectionCount: stat.detectionCount,
                lastDetected: stat.lastDetected.toISOString()
            })).sort((a, b) => b.detectionCount - a.detectionCount) // Sort by detection count
        };

        res.json({
            message: "Person location statistics fetched successfully",
            data: locationStats
        });

    } catch (error) {
        console.error('Error in getPersonLocationStats:', error);
        next(createHttpError(500, "Error fetching person location stats"));
    }
};

export const getPersonCameraLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { personId } = req.params;

        const detections = await prisma.recognizedPerson.findMany({
            where: {
                personId
            },
            select: {
                camera: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        latitude: true,
                        longitude: true,
                        status: true,
                        streamUrl: true,
                        nearestPoliceStation: true
                    }
                }
            },
            distinct: ['cameraId']
        });

        // Extract unique cameras and remove duplicates
        const uniqueCameras = Array.from(
            new Map(detections.map(d => [d.camera.id, d.camera])).values()
        );

        console.log("unique cameras", uniqueCameras);
        

        res.json({
            message: "Person's camera locations fetched successfully",
            data: uniqueCameras
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching person's camera locations"));
    }
};

async function getPersonMovementFlow(req: Request, res: Response) {
    const { personId } = req.params;
    
    try {
        // Get all detections for this person, ordered by timestamp
        const detections = await prisma.recognizedPerson.findMany({
            where: {
                personId
            },
            select: {
                id: true,
                capturedDateTime: true,
                camera: {
                    select: {
                        name: true,
                        location: true,
                        latitude: true,
                        longitude: true
                    }
                }
            },
            orderBy: {
                capturedDateTime: 'asc'
            }
        });

        // Process detections to create movement flow
        const movementFlow = detections.reduce((flow: any[], detection, index) => {
            if (index === 0) {
                // First detection
                flow.push({
                    location: detection.camera.location,
                    timestamp: detection.capturedDateTime,
                    latitude: detection.camera.latitude,
                    longitude: detection.camera.longitude,
                    isRepeated: false
                });
                return flow;
            }

            const lastLocation = flow[flow.length - 1].location;
            const currentLocation = detection.camera.location;
            const timeDiff = new Date(detection.capturedDateTime).getTime() - 
                            new Date(flow[flow.length - 1].timestamp).getTime();

            // Only add if location is different or if same location appears after significant time (e.g., 30 minutes)
            if (currentLocation !== lastLocation || timeDiff > 60 * 60 * 1000) {
                flow.push({
                    location: currentLocation,
                    timestamp: detection.capturedDateTime,
                    latitude: detection.camera.latitude,
                    longitude: detection.camera.longitude,
                    isRepeated: flow.some(f => f.location === currentLocation)
                });
            }

            return flow;
        }, []);

        res.json({
            success: true,
            data: movementFlow
        });

    } catch (error) {
        console.error('Error fetching person movement flow:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch movement flow'
        });
    }
}

export { getAllPersons, getPersonById, createPerson, updatePerson, deletePerson, searchPersons, getPersonStats, getPersonLocationStats, getPersonCameraLocations, getPersonMovementFlow };