import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { addTaskToList, updateTaskInList, removeTaskFromList, moveTask, addList, updateList, removeList, updateBoard, upsertBoard, removeBoard, clearCurrentBoard } from '@/store/boardsSlice';

function normalize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(normalize);
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (key === '_id') {
        res.id = String(val);
      } else {
        res[key] = normalize(val);
      }
    }
    return res;
  }
  return obj;
}

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

  socket.on('task:created', (payload: any) => {
    const normalized = normalize(payload);
    store.dispatch(addTaskToList(normalized));
  });
  socket.on('task:updated', (task: any) => {
    store.dispatch(updateTaskInList(normalize(task)));
  });
  socket.on('task:moved', (payload: any) => {
    store.dispatch(moveTask(normalize(payload)));
  });
  socket.on('task:deleted', (data: any) => {
    store.dispatch(removeTaskFromList(normalize(data)));
  });
  socket.on('list:created', (list: any) => {
    store.dispatch(addList(normalize(list)));
  });
  socket.on('list:updated', (list: any) => {
    store.dispatch(updateList(normalize(list)));
  });
  socket.on('list:deleted', (data: any) => {
    store.dispatch(removeList(normalize(data)));
  });
  socket.on('board:updated', (board: any) => {
    const normalized = normalize(board);
    const state = store.getState();
    const userId = state.auth.user?.id;
    const isMember = normalized.members && userId && normalized.members.some((m: any) => m.id === userId);
    if (isMember) {
      store.dispatch(upsertBoard(normalized));
      if (state.boards.currentBoard && state.boards.currentBoard.id === normalized.id) {
        store.dispatch(updateBoard(normalized));
      }
    } else {
      store.dispatch(removeBoard({ boardId: normalized.id }));
    }
  });
  socket.on('board:added', (board: any) => {
    const normalized = normalize(board);
    store.dispatch(upsertBoard(normalized));
  });
  socket.on('board:removed', (payload: any) => {
    const { boardId } = normalize(payload);
    const state = store.getState();
    const current = state.boards.currentBoard;
    if (current && current.id === boardId) {
      store.dispatch(clearCurrentBoard());
    }
    store.dispatch(removeBoard({ boardId }));
    socket?.emit('board:leave', boardId);
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
