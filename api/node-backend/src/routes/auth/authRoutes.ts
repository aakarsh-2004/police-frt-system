import { Router } from "express";
import { login, verifyToken } from "../../controllers/auth/authController";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/verify', verifyToken);

export default authRouter; 