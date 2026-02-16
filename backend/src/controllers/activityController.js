import { Activity } from '../models/Activity.js';

export const activityController = {
  getByBoard: async (req, res) => {
    try {
      const { boardId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const activities = await Activity.find({ boardId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Activity.countDocuments({ boardId });

      return res.json({
        data: activities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get activity error:', error);
      return res.status(500).json({ message: 'Failed to fetch activity' });
    }
  },
};
