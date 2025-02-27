import { Router } from "express";
import { createPerson, deletePerson, getAllPersons, getPersonById, updatePerson, searchPersons, getPersonStats, getPersonLocationStats, getPersonCameraLocations, getPersonMovementFlow } from "../../controllers/person/personController";
import path from "node:path";
import multer from "multer";
import { authMiddleware } from '../../middleware/auth';

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const personRouter = Router();

// Public routes
personRouter.get('/stats', getPersonStats);
personRouter.get('/search', searchPersons);
personRouter.get('/', getAllPersons);
personRouter.get('/:id', getPersonById);
personRouter.get('/:id/locations', getPersonLocationStats);
personRouter.get('/:personId/cameras', getPersonCameraLocations);
personRouter.get('/:personId/movement-flow', getPersonMovementFlow);

// Protected routes
personRouter.use(authMiddleware);

personRouter.post('/', 
    upload.single('personImage'), // Match the field name with frontend
    createPerson
);

personRouter.put('/:id', 
    upload.single('personImage'),
    updatePerson
);

personRouter.delete('/:id', deletePerson);

export default personRouter;