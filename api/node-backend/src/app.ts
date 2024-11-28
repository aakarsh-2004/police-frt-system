import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cors from "cors";
import personRouter from "./routes/person/personRoutes";
import statsRouter from "./routes/stats/statsRoutes";
import authRouter from "./routes/auth/authRoutes";
import userRouter from "./routes/user/userRoutes";
import requestRouter from "./routes/request/requestRoutes";
import recognitionRouter from "./routes/recognition/recognitionRoutes";

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
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

export default app;