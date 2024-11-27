import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import cors from "cors";
import personRouter from "./routes/person/personRoutes";
import statsRouter from "./routes/stats/statsRoutes";

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

export default app;