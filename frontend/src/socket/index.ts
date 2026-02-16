import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { addTaskToList, updateTaskInList, removeTaskFromList, moveTask, addList, updateList } from '@/store/boardsSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => console.log('[Socket] Connected'));
  socket.on('disconnect', () => console.log('[Socket] Disconnected'));

  socket.on('task:created', (data: { listId: string; task: any }) => {
    store.dispatch(addTaskToList(data));
  });
  socket.on('task:updated', (task: any) => {
    store.dispatch(updateTaskInList(task));
  });
  socket.on('task:moved', (data: any) => {
    store.dispatch(moveTask(data));
  });
  socket.on('task:deleted', (data: { listId: string; taskId: string }) => {
    store.dispatch(removeTaskFromList(data));
  });
  socket.on('list:created', (list: any) => {
    store.dispatch(addList(list));
  });
  socket.on('list:updated', (list: any) => {
    store.dispatch(updateList(list));
  });
}

export function joinBoard(boardId: string) {
  socket?.emit('board:join', boardId);
}

export function leaveBoard(boardId: string) {
  socket?.emit('board:leave', boardId);
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket() {
  return socket;
}
