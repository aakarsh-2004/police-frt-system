import { Router } from "express";
import { getRecentRecognitions, addRecognition } from "../../controllers/recognition/recognitionController";
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

export default recognitionRouter; 