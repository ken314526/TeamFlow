import express from 'express';
import { boardController } from '../controllers/boardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, boardController.getAll);
router.post('/', authMiddleware, boardController.create);
router.get('/:id', authMiddleware, boardController.getById);
router.put('/:id', authMiddleware, boardController.update);
router.delete('/:id', authMiddleware, boardController.delete);
router.post('/:id/members', authMiddleware, boardController.addMember);
router.delete('/:id/members/:userId', authMiddleware, boardController.removeMember);

export default router;
