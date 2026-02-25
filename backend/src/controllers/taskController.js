import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { Activity } from "../models/Activity.js";
import { io } from '../index.js';
import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitTaskMoved,
} from '../websocket/socketHandlers.js';

export const taskController = {
  create: async (req, res) => {
    try {
      const { listId, title, description } = req.body;

      const list = await List.findById(listId);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const taskCount = await Task.countDocuments({ listId });
      const task = new Task({
        listId,
        title,
        description,
        position: taskCount,
        createdBy: req.userId,
      });

      await task.save();
      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:create",
        details: `Created task "${title}"`,
      });

      emitTaskCreated(io, list.boardId, task);
      return res.status(201).json(task);
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({ message: "Failed to create task" });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, labels, dueDate, completed } = req.body;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const list = await List.findById(task.listId);
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      task.title = title || task.title;
      task.description = description || task.description;
      task.labels = labels || task.labels;
      task.dueDate = dueDate || task.dueDate;
      if (typeof completed === 'boolean') task.completed = completed;

      await task.save();
      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Updated task "${title}"`,
      });

      emitTaskUpdated(io, list.boardId, task);
      return res.json(task);
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({ message: "Failed to update task" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const list = await List.findById(task.listId);
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await task.deleteOne();

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:delete",
        details: `Deleted task "${task.title}"`,
      });

      emitTaskDeleted(io, list.boardId, list._id.toString(), task._id.toString());
      return res.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({ message: "Failed to delete task" });
    }
  },

  move: async (req, res) => {
    try {
      const { id } = req.params;
      const { listId, position } = req.body;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const oldList = await List.findById(task.listId);
      task.listId = listId;
      task.position = position;

      await task.save();
      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      const newList = await List.findById(listId);
      const board = await import('../models/Board.js').then(m => m.Board.findById(newList.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Activity.create({
        boardId: newList.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Moved task to "${newList.title}"`,
      });

      emitTaskMoved(io, newList.boardId, {
        sourceListId: oldList._id.toString(),
        destListId: task.listId.toString(),
        taskId: task._id.toString(),
        newPosition: task.position,
      });
      return res.json(task);
    } catch (error) {
      console.error("Move task error:", error);
      return res.status(500).json({ message: "Failed to move task" });
    }
  },

  assign: async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const list = await List.findById(task.listId);
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      if (!task.assignees.includes(userId)) {
        task.assignees.push(userId);
        await task.save();
      }

      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Assigned user to task`,
      });

      emitTaskUpdated(io, list.boardId, task);
      return res.json(task);
    } catch (error) {
      console.error("Assign task error:", error);
      return res.status(500).json({ message: "Failed to assign task" });
    }
  },

  unassign: async (req, res) => {
    try {
      const { id, userId } = req.params;

      const task = await Task.findById(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const list = await List.findById(task.listId);
      const board = await import('../models/Board.js').then(m => m.Board.findById(list.boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      task.assignees = task.assignees.filter((a) => a.toString() !== userId);
      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Unassigned user from task`,
      });
      emitTaskUpdated(io, list.boardId, task);
      return res.json(task);
    } catch (error) {
      console.error("Unassign task error:", error);
      return res.status(500).json({ message: "Failed to unassign task" });
    }
  },

  search: async (req, res) => {
    try {
      const { boardId, query } = req.query;

      const board = await import('../models/Board.js').then(m => m.Board.findById(boardId));
      if (!board || !board.members.some((m) => m.toString() === req.userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const tasks = await Task.find({
        $text: { $search: query },
      }).populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      return res.json(tasks);
    } catch (error) {
      const tasks = await Task.find({
        title: { $regex: query, $options: "i" },
      }).populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      return res.json(tasks);
    }
  },
};
