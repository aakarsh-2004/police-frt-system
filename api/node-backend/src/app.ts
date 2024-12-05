import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cors from "cors";
import personRouter from "./routes/person/personRoutes";
import statsRouter from "./routes/stats/statsRoutes";
import authRouter from "./routes/auth/authRoutes";
import userRouter from "./routes/user/userRoutes";
import requestRouter from "./routes/request/requestRoutes";
import recognitionRouter from "./routes/recognition/recognitionRoutes";
import cameraRouter from "./routes/camera/cameraRoutes";
import alertRouter from './routes/alert/alertRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://frt-system-client.vercel.app", "https://frt-system-client-68fw0x2f7-sp4rtas-projects.vercel.app/"],
    credentials: true
}));

app.get('/api', (req: Request, res: Response, next: NextFunction) => {
    const error = createHttpError(400, "Something went wrong");
    throw error;
})

app.use('/api/persons', personRouter);
app.use('/api/stats', statsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/requests', requestRouter);
app.use('/api/recognitions', recognitionRouter);
app.use('/api/cameras', cameraRouter);
app.use('/api/alerts', alertRouter);

app.use(errorHandler);

export default app;
