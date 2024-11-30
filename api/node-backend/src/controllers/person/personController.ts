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
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const { role } = req.user as { role: string };

    try {
        if (role === 'admin') {
            const {
                firstName,
                lastName,
                age,
                dateOfBirth,
                gender,
                email,
                phone,
                address,
                type,
                nationalId,
                nationality,
                // Files for missing or suspect
                riskLevel,       
                lastSeenDate,    
                lastSeenLocation,
                missingSince,    
                status,          
                reportBy         
            } = req.body

            if (!firstName || !lastName || !age || !gender || !email || !phone || !address || !type || !nationality) {
                res.status(400).json({
                    message: 'Missing required fields'
                });
                return;
            }

            if (!req.files || !('personImageUrl' in req.files)) {
                res.status(400).json({
                    message: 'User image is required'
                });
                return;
            }

            const personImageMimeType = files.personImageUrl[0].mimetype.split('/').at(-1);
            const fileName = files.personImageUrl[0].filename;
            const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);

            const result = await prisma.$transaction(async (prisma) => {
                const imageUrl = await cloudinary.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'person-images',
                    format: personImageMimeType
                })
                const person = await prisma.person.create({
                    data: {
                        firstName,
                        lastName,
                        age: parseInt(age),
                        dateOfBirth: new Date(dateOfBirth),
                        gender,
                        email,
                        phone,
                        address,
                        personImageUrl: imageUrl.secure_url,
                        type,
                        nationalId,
                        nationality
                    }
                });

                if (type === 'suspect') {
                    const fullName = `${firstName} ${lastName}`;
                    const crimeRecord = await prisma.crimeRecord.findFirst({
                        where: {
                            personName: {
                                equals: fullName
                            }
                        }
                    });

                    await prisma.suspect.create({
                        data: {
                            personId: person.id,
                            riskLevel: riskLevel || 'low',
                            foundStatus: false,
                            criminalId: crimeRecord?.id || null
                        }
                    });
                } else if (type === 'missing-person') {
                    await prisma.missingPerson.create({
                        data: {
                            personId: person.id,
                            lastSeenDate: new Date(lastSeenDate),
                            lastSeenLocation,
                            missingSince: new Date(missingSince),
                            foundStatus: false,
                            reportBy
                        }
                    });
                }

                return person
            })

            res.status(201).json({
                message: `${type} created successfully`,
                person: result
            })
        } else {
            const requestData = {
                requestedBy: (req.user as { id: string }).id,
                status: 'pending',
                personData: JSON.stringify({
                    ...req.body,
                    personImageUrl: null
                })
            };

            if (files?.personImageUrl) {
                const fileName = files.personImageUrl[0].filename;
                const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);
                
                const imageUrl = await cloudinary.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'temp-requests'
                });

                requestData.personData = JSON.stringify({
                    ...JSON.parse(requestData.personData),
                    personImageUrl: imageUrl.secure_url
                });

                fs.unlinkSync(filePath);
            }

            const request = await prisma.requests.create({
                data: requestData,
                include: {
                    user: true
                }
            });

            res.status(201).json({
                message: "Request created successfully. Waiting for admin approval.",
                data: request
            });
        }
    } catch (error) {
        next(createHttpError(500, "Error while creating person/request " + error));
    }
};

const updatePerson = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
        firstName,
        lastName,
        age,
        dateOfBirth,
        gender,
        email,
        phone,
        address,
        type,
        nationalId,
        nationality,
        // Files for missing or suspect
        riskLevel,
        foundStatus,       
        lastSeenDate,    
        lastSeenLocation,
        missingSince,    
        status,          
        reportBy         
    } = req.body

    const files = req.files as { [key: string]: Express.Multer.File[] };
    const personImageMimeType = files.personImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.personImageUrl[0].filename;
    const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const person = await prisma.person.findUnique({
                where: {
                    id: id
                }
            });

            if (!person) {
                next(createHttpError(404, "Person not found"));
                return;
            }
            let imageUrl;
            if(files.personImageUrl && person && person.personImageUrl) {
                try {
                    const personSplit = person.personImageUrl.split('/');
                    const lastTwo = personSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const personImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        await cloudinary.uploader.destroy(personImageSplit);
                    }
                } catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting target picture ' + error
                    })
                }
                imageUrl = await cloudinary.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'person-images',
                    format: personImageMimeType
                })
            }

            const updatedPerson = await prisma.person.update({
                where: { id },
                data: { 
                    firstName,
                    lastName,
                    age: parseInt(age),
                    dateOfBirth: new Date(dateOfBirth),
                    gender,
                    email,
                    phone,
                    address,
                    personImageUrl: imageUrl?.secure_url || person.personImageUrl,
                    nationality,
                    nationalId
                }
            })

            if (type === 'suspect') {
                await prisma.suspect.update({
                    where: { personId: updatedPerson.id },
                    data: {
                        riskLevel: riskLevel || 'low',
                        foundStatus: (parseInt(foundStatus) === 1 ? true : false) || false
                    }
                });
            } else if (type === 'missing-person') {
                await prisma.missingPerson.update({
                    where: { personId: updatedPerson.id },
                    data: {
                        lastSeenDate: new Date(lastSeenDate),
                        lastSeenLocation,
                        missingSince: new Date(missingSince),
                        foundStatus: (parseInt(status) === 1 ? true : false) || false,
                        reportBy
                    }
                });
            }

            return updatedPerson;
        })

        res.status(200).json({
            message: `${type} updated successfully`,
            person: result
        });

    } catch (error) {
        next(createHttpError(500, "Error while updating person " + error));
    } finally {
        try {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully');
        } catch (error) {
            next(createHttpError(500, "Error while deleting file " + error));
        }
    }
}

const deletePerson = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const person = await prisma.person.findUnique({
                where: { id }
            });

            if (!person) {
                next(createHttpError(404, "Person not found"));
                return;
            }

            if (person.personImageUrl) {
                try {
                    const personSplit = person.personImageUrl.split('/');
                    const lastTwo = personSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const personImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        await cloudinary.uploader.destroy(personImageSplit);
                    }
                } catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting image ' + error
                    });
                }
            }

            if (person.type === 'suspect') {
                await prisma.suspect.delete({
                    where: { personId: id }
                });
            } else if (person.type === 'missing-person') {
                await prisma.missingPerson.delete({
                    where: { personId: id }
                });
            }

            await prisma.person.delete({
                where: { id }
            });

            return person;
        });

        res.status(200).json({
            message: "Person deleted successfully",
            person: result
        });
    } catch (error) {
        next(createHttpError(500, "Error while deleting person " + error));
    }
}

const searchPersons = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.query;
        console.log('Search query:', query);

        // If no query, return all persons
        if (!query || typeof query !== 'string' || query.trim() === '') {
            const persons = await prisma.person.findMany({
                include: {
                    suspect: true,
                    missingPerson: true
                },
                orderBy: {
                    firstName: 'asc'
                }
            });
            
            return res.status(200).json({
                message: "All persons fetched successfully",
                data: persons
            });
        }

        const searchQuery = query.trim().toLowerCase();
        console.log('Processing search query:', searchQuery);

        const persons = await prisma.person.findMany({
            where: {
                OR: [
                    { firstName: { contains: searchQuery, mode: 'insensitive' } },
                    { lastName: { contains: searchQuery, mode: 'insensitive' } }
                ]
            },
            include: {
                suspect: true,
                missingPerson: true
            },
            orderBy: {
                firstName: 'asc'
            }
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

export { getAllPersons, getPersonById, createPerson, updatePerson, deletePerson, searchPersons };