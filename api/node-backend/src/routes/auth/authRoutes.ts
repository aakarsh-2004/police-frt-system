import { Router } from "express";
import { login, verifyToken, sendOTP, verifyOTP, loginWithOTP } from "../../controllers/auth/authController";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/verify', verifyToken);
authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOTP);
authRouter.post('/login-with-otp', loginWithOTP);

export default authRouter; 