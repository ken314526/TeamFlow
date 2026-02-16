import express from 'express';
import { listController } from '../controllers/listController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:boardId/lists', authMiddleware, listController.getByBoard);
router.post('/', authMiddleware, listController.create);
router.put('/:id', authMiddleware, listController.update);
router.delete('/:id', authMiddleware, listController.delete);
router.put('/:id/reorder', authMiddleware, listController.reorder);

export default router;
