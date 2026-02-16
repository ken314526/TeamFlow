import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { User } from '../models/User.js';

export const boardController = {
  getAll: async (req, res) => {
    try {
      const boards = await Board.find({ members: req.userId }).populate('createdBy', 'name email');
      return res.json(boards);
    } catch (error) {
      console.error('Get boards error:', error);
      return res.status(500).json({ message: 'Failed to fetch boards' });
    }
  },

  create: async (req, res) => {
    try {
      const { name, description, color } = req.body;

      const board = new Board({
        name,
        description,
        color,
        createdBy: req.userId,
        members: [req.userId],
      });

      await board.save();
      await board.populate('createdBy', 'name email');

      await Activity.create({
        boardId: board._id,
        userId: req.userId,
        action: 'board:create',
        details: `Created board "${name}"`,
      });

      return res.status(201).json(board);
    } catch (error) {
      console.error('Create board error:', error);
      return res.status(500).json({ message: 'Failed to create board' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const board = await Board.findById(id).populate('createdBy', 'name email').populate('members', 'name email');

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (!board.members.some((m) => m._id.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.json(board);
    } catch (error) {
      console.error('Get board error:', error);
      return res.status(500).json({ message: 'Failed to fetch board' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.createdBy.toString() !== req.userId) {
        return res.status(403).json({ message: 'Only board creator can update' });
      }

      board.name = name || board.name;
      board.description = description || board.description;
      board.color = color || board.color;

      await board.save();
      await board.populate('createdBy', 'name email');

      await Activity.create({
        boardId: board._id,
        userId: req.userId,
        action: 'board:update',
        details: `Updated board "${board.name}"`,
      });

      return res.json(board);
    } catch (error) {
      console.error('Update board error:', error);
      return res.status(500).json({ message: 'Failed to update board' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      if (board.createdBy.toString() !== req.userId) {
        return res.status(403).json({ message: 'Only board creator can delete' });
      }

      const lists = await List.find({ boardId: id });
      const taskIds = [];

      for (const list of lists) {
        const tasks = await Task.find({ listId: list._id });
        taskIds.push(...tasks.map((t) => t._id));
      }

      await Task.deleteMany({ _id: { $in: taskIds } });
      await List.deleteMany({ boardId: id });
      await Activity.deleteMany({ boardId: id });
      await board.deleteOne();

      return res.json({ message: 'Board deleted successfully' });
    } catch (error) {
      console.error('Delete board error:', error);
      return res.status(500).json({ message: 'Failed to delete board' });
    }
  },

  addMember: async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (board.members.includes(user._id)) {
        return res.status(409).json({ message: 'User already member' });
      }

      board.members.push(user._id);
      await board.save();
      await board.populate('members', 'name email');

      await Activity.create({
        boardId: board._id,
        userId: req.userId,
        action: 'board:update',
        details: `Added ${user.email} to board`,
      });

      return res.json(board);
    } catch (error) {
      console.error('Add member error:', error);
      return res.status(500).json({ message: 'Failed to add member' });
    }
  },

  removeMember: async (req, res) => {
    try {
      const { id, userId } = req.params;

      const board = await Board.findById(id);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      board.members = board.members.filter((m) => m.toString() !== userId);
      await board.save();
      await board.populate('members', 'name email');

      const user = await User.findById(userId);

      await Activity.create({
        boardId: board._id,
        userId: req.userId,
        action: 'board:update',
        details: `Removed ${user.email} from board`,
      });

      return res.json(board);
    } catch (error) {
      console.error('Remove member error:', error);
      return res.status(500).json({ message: 'Failed to remove member' });
    }
  },
};
