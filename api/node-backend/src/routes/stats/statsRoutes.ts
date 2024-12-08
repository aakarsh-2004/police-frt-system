import { Router } from "express";
import { getRecognitionStats, getPersonStats, getDetectionTrends } from "../../controllers/stats/statsController";

const statsRouter = Router();

statsRouter.get('/recognitions', getRecognitionStats);
statsRouter.get('/persons', getPersonStats);
statsRouter.get('/trends', getDetectionTrends);

export default statsRouter; 