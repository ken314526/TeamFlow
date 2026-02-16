import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'board:create',
        'board:update',
        'board:delete',
        'list:create',
        'list:update',
        'list:delete',
        'task:create',
        'task:update',
        'task:delete',
      ],
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export const Activity = mongoose.model('Activity', activitySchema);
