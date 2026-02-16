import { List } from '../models/List.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';

export const listController = {
  getByBoard: async (req, res) => {
    try {
      const { boardId } = req.params;

      const lists = await List.find({ boardId }).sort({ position: 1 });

      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          const tasks = await Task.find({ listId: list._id }).sort({ position: 1 }).populate([
            { path: 'createdBy', select: 'name email' },
            { path: 'assignees', select: 'name email' },
          ]);
          const obj = list.toObject();
          obj.tasks = tasks;
          return obj;
        })
      );

      return res.json(listsWithTasks);
    } catch (error) {
      console.error('Get lists error:', error);
      return res.status(500).json({ message: 'Failed to fetch lists' });
    }
  },

  create: async (req, res) => {
    try {
      const { boardId, title } = req.body;

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

      const list = await List.findByIdAndUpdate(id, { title }, { returnDocument: 'after' });

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      await Activity.create({
        boardId: list.boardId,
        userId: req.userId,
        action: 'list:update',
        details: `Updated list "${title}"`,
      });

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

      const tasks = await Task.find({ listId: id });

      await Task.deleteMany({ listId: id });
      await list.deleteOne();

      await Activity.create({
        boardId: list.boardId,
        userId: req.userId,
        action: 'list:delete',
        details: `Deleted list with ${tasks.length} tasks`,
      });

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

      list.position = newPosition;
      await list.save();

      return res.json(list);
    } catch (error) {
      console.error('Reorder error:', error);
      return res.status(500).json({ message: 'Failed to reorder' });
    }
  },
};
