import express from 'express';
import { activityController } from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:boardId/activity', authMiddleware, activityController.getByBoard);

export default router;
