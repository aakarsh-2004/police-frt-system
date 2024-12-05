import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import path from "node:path";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import fs from "node:fs";

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
                    orderBy: {
                        capturedDateTime: 'desc'
                    }
                }
            }
        });

        if (!person) {
            return next(createHttpError(404, "Person not found"));
        }

        res.status(200).json({
            message: "Person fetched successfully",
            data: person
        });
    } catch (error) {
        next(createHttpError(500, "Error while fetching person by id " + error));
    }
}

const createPerson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const file = req.file || (req.files as any)?.personImageUrl?.[0];

        console.log('Received data:', data);
        console.log('Received files:', file);

        // Validate required fields
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

        // Parse the nested objects if they were stringified
        const suspectData = data.suspect ? JSON.parse(data.suspect) : null;
        const missingPersonData = data.missingPerson ? JSON.parse(data.missingPerson) : null;

        const person = await prisma.person.create({
            data: {
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
                personImageUrl: imageUrl,
                ...(data.type === 'suspect' && {
                    suspect: {
                        create: {
                            riskLevel: data.riskLevel || 'low',
                            foundStatus: false
                        }
                    }
                }),
                ...(data.type === 'missing-person' && {
                    missingPerson: {
                        create: {
                            lastSeenDate: new Date(data.lastSeenDate),
                            lastSeenLocation: data.lastSeenLocation,
                            missingSince: new Date(data.missingSince || data.lastSeenDate),
                            foundStatus: false,
                            reportBy: data.reportBy
                        }
                    }
                })
            },
            include: {
                suspect: true,
                missingPerson: true
            }
        });

        res.status(201).json({
            message: "Person created successfully",
            data: person
        });
    } catch (error) {
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

const deletePerson = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

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

        await prisma.$transaction(async (tx) => {
            if (person.type === 'suspect' && person.suspect) {
                await tx.suspect.delete({
                    where: { personId: id }
                });
            } else if (person.type === 'missing-person' && person.missingPerson) {
                await tx.missingPerson.delete({
                    where: { personId: id }
                });
            }

            // 2. Delete all recognitions for this person
            await tx.recognizedPerson.deleteMany({
                where: { personId: id }
            });

            // 3. Delete the person record
            await tx.person.delete({
                where: { id }
            });
        });

        res.json({
            message: "Person deleted successfully",
            data: person
        });
    } catch (error) {
        console.error('Delete error:', error);
        next(createHttpError(500, "Error deleting person: " + error));
    }
};

const searchPersons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q: query } = req.query;
        console.log('Search query:', query);

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(200).json({
                message: "No search query provided",
                data: []
            });
        }

        const searchQuery = query.trim().toLowerCase();
        console.log('Processing search query:', searchQuery);

        const persons = await prisma.person.findMany({
            where: {
                OR: [
                    { firstName: { contains: searchQuery, mode: 'insensitive' } },
                    { lastName: { contains: searchQuery, mode: 'insensitive' } },
                    { address: { contains: searchQuery, mode: 'insensitive' } },
                    { nationalId: { contains: searchQuery, mode: 'insensitive' } }
                ]
            },
            include: {
                suspect: true,
                missingPerson: true
            },
            take: 10 // Limit results to 10 for better performance
        });

        console.log(`Found ${persons.length} matches`);
        
        res.status(200).json({
            message: "Search results fetched successfully",
            data: persons
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

export { getAllPersons, getPersonById, createPerson, updatePerson, deletePerson, searchPersons, getPersonStats };