import express from 'express';
import axios from 'axios';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/proxy-image', authenticateUser, async (req, res) => {
    try {
        const imageUrl = req.query.url as string;
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error('Error proxying image:', error);
        res.status(500).json({ message: 'Error fetching image' });
    }
});

export default router; 