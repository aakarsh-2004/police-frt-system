import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";
import { createNotification } from "../notification/notificationController";

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

        // Convert the request body to a string
        const personData = JSON.stringify(req.body);
        const imageData = req.file ? JSON.stringify(req.file) : null;

        console.log('Creating request with data:', {
            personData,
            imageData,
            userId: user.id
        });

        const request = await prisma.requests.create({
            data: {
                requestedBy: user.id,
                status: 'pending',
                personData,
                imageData
            },
            include: {
                user: true
            }
        });

        // Create notification for admins
        await createNotification(
            `New person request from ${user.firstName} ${user.lastName}`,
            'request'
        );

        res.status(201).json({
            message: "Request submitted successfully",
            data: request
        });
    } catch (error) {
        console.error('Error in createRequest:', error);
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

        // Extract fields specific to different models
        const {
            riskLevel,
            lastSeenDate,
            lastSeenLocation,
            missingSince,
            reportBy,
            ...basicPersonData
        } = personData;

        // Create the person first
        const person = await prisma.person.create({
            data: {
                ...basicPersonData,
                age: parseInt(basicPersonData.age),
                dateOfBirth: new Date(basicPersonData.dateOfBirth),
                personImageUrl: request.imageData ? JSON.parse(request.imageData).path : null
            }
        });

        // Create related records based on person type
        if (personData.type === 'suspect') {
            await prisma.suspect.create({
                data: {
                    personId: person.id,
                    riskLevel: riskLevel || 'low',
                    foundStatus: false
                }
            });
        } else if (personData.type === 'missing-person') {
            await prisma.missingPerson.create({
                data: {
                    personId: person.id,
                    lastSeenDate: new Date(lastSeenDate),
                    lastSeenLocation: lastSeenLocation,
                    missingSince: new Date(missingSince || lastSeenDate),
                    foundStatus: false,
                    reportBy: reportBy
                }
            });
        }

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

    try {
        await prisma.requests.update({
            where: { id },
            data: {
                status: 'rejected'
            }
        });

        res.json({ message: "Request rejected successfully" });
    } catch (error) {
        next(createHttpError(500, "Error rejecting request: " + error));
    }
}; 