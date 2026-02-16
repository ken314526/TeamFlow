import express from 'express';
import { commentController } from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:taskId/comments', authMiddleware, commentController.get);
router.post('/:taskId/comments', authMiddleware, commentController.create);

export default router;
