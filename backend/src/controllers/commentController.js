import { Comment } from '../models/Comment.js';

export const commentController = {
  get: async (req, res) => {
    try {
      const { taskId } = req.params;

      const comments = await Comment.find({ taskId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 });

      return res.json(comments);
    } catch (error) {
      console.error('Get comments error:', error);
      return res.status(500).json({ message: 'Failed to fetch comments' });
    }
  },

  create: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { content } = req.body;

      const comment = new Comment({
        taskId,
        userId: req.userId,
        content,
      });

      await comment.save();
      await comment.populate('userId', 'name email avatar');

      return res.status(201).json(comment);
    } catch (error) {
      console.error('Create comment error:', error);
      return res.status(500).json({ message: 'Failed to create comment' });
    }
  },
};
