import { Router } from "express";
import { createPerson, deletePerson, getAllPersons, getPersonById, updatePerson, searchPersons, resolvePerson } from "../../controllers/person/personController";
import path from "node:path";
import multer from "multer";
import { authMiddleware } from '../../middleware/auth';

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 }
})

const personRouter = Router();

personRouter.get('/search', searchPersons);
personRouter.get('/', getAllPersons);
personRouter.post('/', 
    authMiddleware,
    upload.fields([
        { name: 'personImageUrl', maxCount: 1 }
    ]),
    createPerson
);
personRouter.get('/:id', getPersonById);
personRouter.put('/:id', 
    upload.fields([
        { name: 'personImageUrl', maxCount: 1 }
    ]),
    updatePerson
);
personRouter.put('/:id/resolve', resolvePerson);
personRouter.delete('/:id', deletePerson);

export default personRouter;