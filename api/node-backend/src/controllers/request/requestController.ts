import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import { createNotification } from "../notification/notificationController";
import cloudinary from "../../config/cloudinary";
import fs from "fs";

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requests = await prisma.requests.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                approvedUser: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        res.status(200).json({
            message: "Requests fetched successfully",
            data: requests
        });
    } catch (error) {
        next(createHttpError(500, "Error fetching requests: " + error));
    }
};

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return next(createHttpError(401, "Unauthorized"));
        }

        const personData = req.body;
        let imageUrl = null;

        // Handle image upload
        if (req.file) {
            try {
                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'requests',
                    resource_type: 'image'
                });
                imageUrl = result.secure_url;

                // Clean up local file
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting local file:', err);
                });
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return next(createHttpError(500, "Error uploading image"));
            }
        }

        // Create request with image data
        const request = await prisma.requests.create({
            data: {
                requestedBy: user.id,
                status: 'pending',
                personData: JSON.stringify({
                    ...personData,
                    personImageUrl: imageUrl // Store image URL in personData
                }),
                imageData: imageUrl // Store Cloudinary URL directly in imageData
            }
        });

        res.status(201).json({
            message: "Request created successfully",
            data: request
        });
    } catch (error) {
        next(createHttpError(500, "Error creating request: " + error));
    }
};

export const approveRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { approvedBy } = req.body;

    try {
        const request = await prisma.requests.findUnique({
            where: { id }
        });

        if (!request) {
            return next(createHttpError(404, "Request not found"));
        }

        // Parse the person data
        let personData;
        try {
            personData = JSON.parse(request.personData as string);
            console.log('Parsed person data:', personData);
        } catch (parseError) {
            console.error('Error parsing person data:', parseError);
            return next(createHttpError(400, "Invalid person data format"));
        }

        // Parse image data if exists
        let imageData;
        if (request.imageData) {
            try {
                imageData = JSON.parse(request.imageData);
                personData.personImageUrl = imageData.path; 
            } catch (parseError) {
                console.error('Error parsing image data:', parseError);
            }
        }

        // Parse missing person data if exists
        let missingPersonData;
        if (personData.missingPerson) {
            try {
                missingPersonData = JSON.parse(personData.missingPerson);
            } catch (parseError) {
                console.error('Error parsing missing person data:', parseError);
                return next(createHttpError(400, "Invalid missing person data format"));
            }
        }

        // Create the person with image URL
        const person = await prisma.person.create({
            data: {
                firstName: personData.firstName,
                lastName: personData.lastName,
                age: parseInt(personData.age),
                dateOfBirth: new Date(personData.dateOfBirth),
                address: personData.address,
                type: personData.type,
                gender: personData.gender,
                email: personData.email,
                phone: personData.phone,
                nationalId: personData.nationalId,
                nationality: personData.nationality,
                personImageUrl: personData.personImageUrl, // Use the image URL from parsed data
                ...(personData.type === 'missing-person' && missingPersonData ? {
                    missingPerson: {
                        create: {
                            lastSeenDate: new Date(missingPersonData.lastSeenDate),
                            lastSeenLocation: missingPersonData.lastSeenLocation,
                            missingSince: new Date(missingPersonData.lastSeenDate),
                            foundStatus: false,
                            reportBy: missingPersonData.reportBy
                        }
                    }
                } : personData.type === 'suspect' ? {
                    suspect: {
                        create: {
                            riskLevel: personData.riskLevel || 'low',
                            foundStatus: false
                        }
                    }
                } : {})
            }
        });

        // Update request status
        await prisma.requests.update({
            where: { id },
            data: {
                status: 'approved',
                approvedBy,
                approvedAt: new Date()
            }
        });

        // Create notification
        await createNotification(
            `Person request approved by admin`,
            'request_approved'
        );

        res.json({ 
            message: "Request approved successfully",
            data: person 
        });
    } catch (error) {
        console.error('Error in approveRequest:', error);
        next(createHttpError(500, "Error approving request: " + error));
    }
};

export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { rejectedBy } = req.body;

    try {
        const request = await prisma.requests.findUnique({
            where: { id }
        });

        if (!request) {
            return next(createHttpError(404, "Request not found"));
        }

        await prisma.requests.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectedBy,
                rejectedAt: new Date()
            }
        });

        // Create notification
        await createNotification(
            `Person request rejected by admin`,
            'request_rejected'
        );

        res.json({ message: "Request rejected successfully" });
    } catch (error) {
        console.error('Error in rejectRequest:', error);
        next(createHttpError(500, "Error rejecting request: " + error));
    }
}; 