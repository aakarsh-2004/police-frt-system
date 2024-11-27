import { Router } from "express";
import { createPerson, deletePerson, getAllPersons, getPersonById, updatePerson } from "../../controllers/person/personController";
import path from "node:path";
import multer from "multer";

const upload = multer({
    dest: path.resolve(__dirname, '../../../public/uploads'),
    limits: { fileSize: 3e7 } // 30mb
})

const personRouter = Router();

personRouter.get('/', getAllPersons);
personRouter.get('/:id', getPersonById);
personRouter.post('/', 
    upload.fields([
        { name: 'personImageUrl', maxCount: 1 }
    ]),
    createPerson
);
personRouter.put('/:id', 
    upload.fields([
        { name: 'personImageUrl', maxCount: 1 }
    ]),
    updatePerson
);
personRouter.delete('/:id', deletePerson);

export default personRouter;