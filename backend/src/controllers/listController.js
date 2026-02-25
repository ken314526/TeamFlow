import { List } from '../models/List.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { io } from '../index.js';
import {
  emitListCreated,
  emitListUpdated,
  emitListDeleted,
} from '../websocket/socketHandlers.js';

export const listController = {
  getByBoard: async (req, res) => {
    try {
      const { boardId } = req.params;

      const board = await import('../models/Board.js').then(m => m.Board.findById(boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const lists = await List.find({ boardId }).sort({ position: 1 });
      const listIds = lists.map((l) => l._id);

      const tasks = await Task.find({ listId: { $in: listIds } })
        .sort({ position: 1 })
        .populate([
          { path: 'createdBy', select: 'name email' },
          { path: 'assignees', select: 'name email' },
        ]);

      const tasksByList = tasks.reduce((acc, task) => {
        const lid = task.listId.toString();
        if (!acc[lid]) acc[lid] = [];
        acc[lid].push(task);
        return acc;
      }, {});

      const listsWithTasks = lists.map((list) => {
        const obj = list.toObject();
        obj.tasks = tasksByList[list._id.toString()] || [];
        return obj;
      });

      return res.json(listsWithTasks);
    } catch (error) {
      console.error('Get lists error:', error);
      return res.status(500).json({ message: 'Failed to fetch lists' });
    }
  },

  create: async (req, res) => {
    try {
      const { boardId, title } = req.body;

      const board = await import('../models/Board.js').then(m => m.Board.findById(boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const listCount = await List.countDocuments({ boardId });

      const list = new List({
        boardId,
        title,
        position: listCount,
      });

      await list.save();

      await Activity.create({
        boardId,
        userId: req.userId,
        action: 'list:create',
        details: `Created list "${title}"`,
      });

      emitListCreated(io, boardId, list);

      return res.status(201).json(list);
    } catch (error) {
      console.error('Create list error:', error);
      return res.status(500).json({ message: 'Failed to create list' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      const list = await List.findById(id);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      list.title = title;
      await list.save();

      await Activity.create({
        boardId: list.boardId,
        userId: req.userId,
        action: 'list:update',
        details: `Updated list "${title}"`,
      });

      emitListUpdated(io, list.boardId, list);

      return res.json(list);
    } catch (error) {
      console.error('Update list error:', error);
      return res.status(500).json({ message: 'Failed to update list' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const list = await List.findById(id);

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const tasks = await Task.find({ listId: id });

      await Task.deleteMany({ listId: id });
      await list.deleteOne();

      await Activity.create({
        boardId: list.boardId,
        userId: req.userId,
        action: 'list:delete',
        details: `Deleted list with ${tasks.length} tasks`,
      });

      emitListDeleted(io, list.boardId, id);

      return res.json({ message: 'List deleted' });
    } catch (error) {
      console.error('Delete list error:', error);
      return res.status(500).json({ message: 'Failed to delete list' });
    }
  },

  reorder: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPosition } = req.body;

      const list = await List.findById(id);

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      list.position = newPosition;
      await list.save();

      emitListUpdated(io, list.boardId, list);

      return res.json(list);
    } catch (error) {
      console.error('Reorder error:', error);
      return res.status(500).json({ message: 'Failed to reorder' });
    }
  },
};
