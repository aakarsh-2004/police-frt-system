import express from 'express';
import { getAlerts } from '../../controllers/alert/alertController';
import { authMiddleware } from '../../middleware/authMiddleware';

const alertRouter = express.Router();

alertRouter.get('/', authMiddleware, getAlerts);

export default alertRouter; 