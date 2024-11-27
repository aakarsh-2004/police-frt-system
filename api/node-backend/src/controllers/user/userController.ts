import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { prisma } from "../../lib/prisma";
import path from "node:path";
import cloudinary from "../../config/cloudinary";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        next(createHttpError(500, "Error while fetching users " + error));
    }
}

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.params.id } });
        res.status(200).json(user);
    } catch (error) {
        next(createHttpError(500, "Error while fetching user " + error));
    }
}

const createUser = async (req: Request, res: Response, next: NextFunction) => {
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
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.userImageUrl[0].filename;
    const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);    

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const imageUrl = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: 'user-images',
                format: userImageMimeType
            });

            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    username,
                    email,
                    password,
                    role,
                    designation,
                    userImageUrl: imageUrl.secure_url,
                    policeId,
                }
            });

            return user;
        })

        res.status(201).json(result);
    } catch (error) {
        next(createHttpError(500, "Error while creating user " + error));
    }
}

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
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const userImageMimeType = files.userImageUrl[0].mimetype.split('/').at(-1);
    const fileName = files.userImageUrl[0].filename;
    const filePath = path.resolve(__dirname, `../../../public/uploads/${fileName}`);

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findUnique({
                where: {
                    id: id
                }
            });

            if(!user) {
                next(createHttpError(404, "User not found"));
                return;
            }

            let imageUrl;
            if(files.userImageUrl && user && user.userImageUrl) {
                try {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        await cloudinary.uploader.destroy(userImageSplit);
                    }

                    imageUrl = await cloudinary.uploader.upload(filePath, {
                        filename_override: fileName,
                        folder: 'user-images',
                        format: userImageMimeType
                    })
                } catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting target picture ' + error
                    })
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: id },
                data: { ...req.body, userImageUrl: imageUrl?.secure_url || user.userImageUrl }
            })

            return updatedUser;
        })

        res.status(200).json(result);
    } catch (error) {
        next(createHttpError(500, "Error while updating user " + error));
    }
}

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findUnique({ where: { id: id } });

            if(!user) {
                next(createHttpError(404, "User not found"));
                return;
            }

            if (user.userImageUrl) {
                try {
                    const userSplit = user.userImageUrl.split('/');
                    const lastTwo = userSplit.slice(-2);
                    if (lastTwo.length === 2) {
                        const userImageSplit = `${lastTwo[0]}/${lastTwo[1].split('.')[0]}`;
                        await cloudinary.uploader.destroy(userImageSplit);
                    }
                } catch (error) {
                    return res.status(500).json({
                        message: 'Error deleting image ' + error
                    });
                }
            }
            
            const result = await prisma.user.delete({ where: { id: id } });
            return result;
        })
        res.status(200).json(result);
    } catch (error) {
        next(createHttpError(500, "Error while deleting user " + error));
    }
}

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
