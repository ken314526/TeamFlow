import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { User } from '../models/User.js';
import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Activity } from '../models/Activity.js';
import { passwordUtils } from '../utils/passwordUtils.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/team-flow';

async function clearExisting(email) {
  const existing = await User.findOne({ email });
  if (!existing) return;
  const userId = existing._id;

  const boards = await Board.find({ $or: [{ createdBy: userId }, { members: userId }] });
  const boardIds = boards.map((b) => b._id);

  const lists = await List.find({ boardId: { $in: boardIds } });
  const listIds = lists.map((l) => l._id);

  const tasks = await Task.find({ listId: { $in: listIds } });
  const taskIds = tasks.map((t) => t._id);

  await Activity.deleteMany({ boardId: { $in: boardIds } });
  await Comment.deleteMany({ taskId: { $in: taskIds } });
  await Task.deleteMany({ listId: { $in: listIds } });
  await List.deleteMany({ boardId: { $in: boardIds } });
  await Board.deleteMany({ _id: { $in: boardIds } });
  await User.deleteOne({ _id: userId });
}

async function seed() {
  await mongoose.connect(MONGODB_URI, { autoIndex: true });
  console.log('Connected to MongoDB for seeding');

  const email = process.env.DEMO_EMAIL;
  await clearExisting(email);

  const plainPassword = process.env.DEMO_PASSWORD;
  const hashed = await passwordUtils.hashPassword(plainPassword);

  const user = await User.create({
    name: 'Demo Showcase',
    email,
    password: hashed,
    avatar: null,
  });

  const board = await Board.create({
    name: 'Demo Project',
    description: 'A showcase project demonstrating features',
    color: 'teal',
    createdBy: user._id,
    members: [user._id],
  });

  const todo = await List.create({ boardId: board._id, title: 'To Do', position: 0 });
  const doing = await List.create({ boardId: board._id, title: 'Doing', position: 1 });
  const done = await List.create({ boardId: board._id, title: 'Done', position: 2 });

  const task1 = await Task.create({
    listId: todo._id,
    title: 'Set up project skeleton',
    description: 'Create initial repo, install dependencies and initialize server',
    position: 0,
    assignees: [user._id],
    labels: ['setup', 'backend'],
    dueDate: null,
    completed: true,
    createdBy: user._id,
  });

  const task2 = await Task.create({
    listId: doing._id,
    title: 'Implement authentication',
    description: 'Login, signup and JWT handling',
    position: 0,
    assignees: [user._id],
    labels: ['auth'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    completed: false,
    createdBy: user._id,
  });

  const task3 = await Task.create({
    listId: doing._id,
    title: 'Create demo UI',
    description: 'A simple showcase board in the frontend for demos',
    position: 1,
    assignees: [user._id],
    labels: ['frontend'],
    dueDate: null,
    completed: false,
    createdBy: user._id,
  });

  await Comment.create({ taskId: task2._id, userId: user._id, content: 'Remember to validate inputs.' });

  await Activity.create({ boardId: board._id, taskId: null, userId: user._id, action: 'board:create', details: 'Created demo board' });
  await Activity.create({ boardId: board._id, taskId: task1._id, userId: user._id, action: 'task:create', details: 'Added initial setup task' });
  await Activity.create({ boardId: board._id, taskId: task2._id, userId: user._id, action: 'task:create', details: 'Added auth task' });

  console.log('Seeding complete. Demo user credentials:');
  console.log(`  email: ${email}`);
  console.log('  password: (from environment or default)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error', err);
  process.exit(1);
});
