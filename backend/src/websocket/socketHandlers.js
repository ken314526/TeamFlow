import { tokenUtils } from '../utils/tokenUtils.js';

export const initializeWebSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Missing token'));
      }

      const payload = tokenUtils.verifyToken(token);
      socket.userId = payload.userId;
      socket.email = payload.email;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on('board:join', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${socket.userId} joined board ${boardId}`);
    });

    socket.on('board:leave', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${socket.userId} left board ${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

export const emitTaskCreated = (io, boardId, task) => {
  io.to(`board:${boardId}`).emit('task:created', task);
};

export const emitTaskUpdated = (io, boardId, task) => {
  io.to(`board:${boardId}`).emit('task:updated', task);
};

export const emitTaskDeleted = (io, boardId, taskId) => {
  io.to(`board:${boardId}`).emit('task:deleted', { id: taskId });
};

export const emitTaskMoved = (io, boardId, task) => {
  io.to(`board:${boardId}`).emit('task:moved', task);
};

export const emitListCreated = (io, boardId, list) => {
  io.to(`board:${boardId}`).emit('list:created', list);
};

export const emitListUpdated = (io, boardId, list) => {
  io.to(`board:${boardId}`).emit('list:updated', list);
};

export const emitListDeleted = (io, boardId, listId) => {
  io.to(`board:${boardId}`).emit('list:deleted', { id: listId });
};

export const emitActivityLogged = (io, boardId, activity) => {
  io.to(`board:${boardId}`).emit('activity:logged', activity);
};
