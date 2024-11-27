import { Router } from "express";
import { getRecognitionStats, getPersonStats } from "../../controllers/stats/statsController";

const statsRouter = Router();

statsRouter.get('/recognitions', getRecognitionStats);
statsRouter.get('/persons', getPersonStats);

export default statsRouter; 