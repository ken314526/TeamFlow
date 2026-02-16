import express from 'express';
import { taskController } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, taskController.create);
router.put('/:id', authMiddleware, taskController.update);
router.delete('/:id', authMiddleware, taskController.delete);
router.put('/:id/move', authMiddleware, taskController.move);
router.post('/:id/assign', authMiddleware, taskController.assign);
router.delete('/:id/assign/:userId', authMiddleware, taskController.unassign);
router.get('/search', authMiddleware, taskController.search);

export default router;
