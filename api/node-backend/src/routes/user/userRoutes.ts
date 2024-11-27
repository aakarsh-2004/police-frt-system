import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../../controllers/user/userController";
import path from "node:path";
import multer from "multer";

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 } // 30mb
})

const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/', 
    upload.fields([
        { name: 'userImageUrl', maxCount: 1 }
    ]),
    createUser
);
userRouter.put('/:id', 
    upload.fields([
        { name: 'userImageUrl', maxCount: 1 }
    ]),
    updateUser
);
userRouter.delete('/:id', deleteUser);

export default userRouter;