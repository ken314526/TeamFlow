import { Task } from "../models/Task.js";
import { List } from "../models/List.js";
import { Activity } from "../models/Activity.js";

export const taskController = {
  create: async (req, res) => {
    try {
      const { listId, title, description } = req.body;

      const list = await List.findById(listId);
      if (!list) {
        return res.status(404).json({ message: "List not found" });
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

      const list = await List.findById(task.listId);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Updated task "${title}"`,
      });

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

      await task.deleteOne();

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:delete",
        details: `Deleted task "${task.title}"`,
      });

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

      await Activity.create({
        boardId: newList.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Moved task to "${newList.title}"`,
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

      if (!task.assignees.includes(userId)) {
        task.assignees.push(userId);
        await task.save();
      }

      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      const list = await List.findById(task.listId);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Assigned user to task`,
      });

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

      task.assignees = task.assignees.filter((a) => a.toString() !== userId);
      await task.save();
      await task.populate([
        { path: "createdBy", select: "name email" },
        { path: "assignees", select: "name email" },
      ]);

      const list = await List.findById(task.listId);

      await Activity.create({
        boardId: list.boardId,
        taskId: task._id,
        userId: req.userId,
        action: "task:update",
        details: `Unassigned user from task`,
      });

      return res.json(task);
    } catch (error) {
      console.error("Unassign task error:", error);
      return res.status(500).json({ message: "Failed to unassign task" });
    }
  },

  search: async (req, res) => {
    try {
      const { boardId, query } = req.query;

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
