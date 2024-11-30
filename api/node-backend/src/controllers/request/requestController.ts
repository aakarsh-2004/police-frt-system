import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import createHttpError from "http-errors";

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requests = await prisma.requests.findMany({
            include: {
                user: true,
                approvedUser: true
            }
        });
        res.json(requests);
    } catch (error) {
        next(createHttpError(500, "Error fetching requests: " + error));
    }
};

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { requestedBy, personData } = req.body;
    const files = req.files as { [key: string]: Express.Multer.File[] };

    try {
        const request = await prisma.requests.create({
            data: {
                requestedBy,
                status: 'pending',
                personData: JSON.stringify(personData),
                imageData: files ? JSON.stringify(files) : null
            },
            include: {
                user: true
            }
        });

        res.status(201).json(request);
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

        const personData = JSON.parse(request.personData as string);
        const imageData = request.imageData ? JSON.parse(request.imageData) : null;

        // Extract fields specific to person
        const {
            riskLevel,
            lastSeenDate,
            lastSeenLocation,
            missingSince,
            status,
            reportBy,
            ...personFields
        } = personData;

        const person = await prisma.person.create({
            data: {
                ...personFields,
                age: parseInt(personFields.age),
                dateOfBirth: new Date(personFields.dateOfBirth)
            }
        });

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
                    lastSeenLocation,
                    missingSince: new Date(missingSince),
                    foundStatus: false,
                    reportBy
                }
            });
        }

        await prisma.requests.update({
            where: { id },
            data: {
                status: 'approved',
                approvedBy,
                approvedAt: new Date()
            }
        });

        res.json({ message: "Request approved successfully", person });
    } catch (error) {
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