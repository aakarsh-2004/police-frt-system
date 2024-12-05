import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import path from "node:path";
import createHttpError from "http-errors";
import cloudinary from "../../config/cloudinary";
import bcrypt from 'bcrypt';
import fs from "node:fs";
import { OTPService } from "../../services/otpService";
import { createNotification } from '../notification/notificationController';

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                role: true,
                designation: true,
                userImageUrl: true,
                policeId: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json(users);
    } catch (error) {
        next(createHttpError(500, "Error while fetching users " + error));
    }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                role: true,
                designation: true,
                userImageUrl: true,
                policeId: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(200).json(user);
    } catch (error) {
        next(createHttpError(500, "Error while fetching user " + error));
    }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        designation,
        phone
    } = req.body;

    if (!firstName || !lastName || !username || !email || !password || !role || !designation || !phone) {
        return next(createHttpError(400, "Missing required fields"));
    }

    const files = req.files as { [key: string]: Express.Multer.File[] };
    let imageUrl = null;

    try {
        if (files && files.userImageUrl) {
            const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
            const fileName = files.userImageUrl[0].filename;
            const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);

            const uploadResponse = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: 'user-images',
                format: userImageMimeType
            });
            imageUrl = uploadResponse.secure_url;

            fs.unlinkSync(filePath);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!phone) {
            return next(createHttpError(400, "Phone number is required"));
        }

        const formattedPhone = OTPService.formatPhoneNumber(phone);

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                password: hashedPassword,
                role,
                designation,
                userImageUrl: imageUrl,
                phone: formattedPhone
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        await createNotification(
            `New user ${firstName} ${lastName} has been created`,
            'NEW_USER'
        );

        res.status(201).json({
            message: "User created successfully",
            data: userWithoutPassword
        });
    } catch (error) {
        next(createHttpError(500, "Error creating user: " + error));
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        designation,
        policeId
    } = req.body;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            let updateData: any = {
                firstName,
                lastName,
                username,
                email,
                role,
                designation,
                policeId
            };

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateData.password = hashedPassword;
            }

            if (req.files && 'userImageUrl' in req.files) {
                const files = req.files as { [key: string]: Express.Multer.File[] };
                const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
                const fileName = files.userImageUrl[0].filename;
                const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);

                if (user.userImageUrl) {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        await cloudinary.uploader.destroy(userImageSplit);
                    }
                }

                const imageUrl = await cloudinary.uploader.upload(filePath, {
                    filename_override: fileName,
                    folder: 'user-images',
                    format: userImageMimeType
                });

                updateData.userImageUrl = imageUrl.secure_url;

                try {
                    fs.unlinkSync(filePath);
                } catch (error) {
                    console.error("Error deleting file:", error);
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData
            });

            const { password: _, ...userWithoutPassword } = updatedUser;
            return userWithoutPassword;
        });

        res.status(200).json(result);
    } catch (error) {
        next(createHttpError(500, "Error while updating user " + error));
    }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) {
                throw createHttpError(404, "User not found");
            }

            if (user.userImageUrl) {
                const userSplit = user.userImageUrl.split('/');
                const lastTwo = userSplit.slice(-2);
                if (lastTwo.length === 2) {
                    const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                    await cloudinary.uploader.destroy(userImageSplit);
                }
            }

            const deletedUser = await prisma.user.delete({
                where: { id }
            });

            const { password: _, ...userWithoutPassword } = deletedUser;
            return userWithoutPassword;
        });

        res.status(200).json(result);
    } catch (error) {
        next(createHttpError(500, "Error while deleting user " + error));
    }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
