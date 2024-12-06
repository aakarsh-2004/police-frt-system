import { Router } from "express";
import { getRecentRecognitions, addRecognition, getAllRecognitionsForReport, getRecognitionStats, shareDetection, getDetectionsByLocation, getDetectionDetails } from "../../controllers/recognition/recognitionController";
import multer from 'multer';
import path from 'path';

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads')
});

const recognitionRouter = Router();

recognitionRouter.get('/recent', getRecentRecognitions);
recognitionRouter.post('/', 
    upload.single('capturedImage'),
    addRecognition
);
recognitionRouter.get('/report', getAllRecognitionsForReport);
recognitionRouter.get('/stats', getRecognitionStats);
recognitionRouter.post('/share', shareDetection);
recognitionRouter.get('/stats/by-location', getDetectionsByLocation);
recognitionRouter.get('/details', getDetectionDetails);

export default recognitionRouter; 