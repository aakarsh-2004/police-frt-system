import { Router } from "express";
import { 
    login, 
    verifyToken, 
    verifyPhoneExists,
    loginWithPhone 
} from "../../controllers/auth/authController";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/verify', verifyToken);
authRouter.post('/verify-phone', verifyPhoneExists);
authRouter.post('/login-with-phone', loginWithPhone);

export default authRouter; 