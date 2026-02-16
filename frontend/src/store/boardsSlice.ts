import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { boardsAPI, listsAPI } from '@/api/services';
import type { Board, BoardsState, List, Task } from '@/types';

const initialState: BoardsState = {
  boards: [],
  currentBoard: null,
  lists: [],
  loading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk('boards/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await boardsAPI.getAll();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch boards');
  }
});

export const fetchBoard = createAsyncThunk('boards/fetchOne', async (id: string, { rejectWithValue }) => {
  try {
    const [boardRes, listsRes] = await Promise.all([
      boardsAPI.getById(id),
      listsAPI.getByBoard(id),
    ]);
    return { board: boardRes.data, lists: listsRes.data };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch board');
  }
});

export const createBoard = createAsyncThunk(
  'boards/create',
  async (data: { name: string; description?: string; color: string }, { rejectWithValue }) => {
    try {
      const res = await boardsAPI.create(data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create board');
    }
  }
);

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setLists(state, action: PayloadAction<List[]>) {
      state.lists = action.payload;
    },
    addTaskToList(state, action: PayloadAction<{ listId: string; task: Task }>) {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) list.tasks.push(action.payload.task);
    },
    updateTaskInList(state, action: PayloadAction<Task>) {
      for (const list of state.lists) {
        const idx = list.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          list.tasks[idx] = action.payload;
          break;
        }
      }
    },
    removeTaskFromList(state, action: PayloadAction<{ listId: string; taskId: string }>) {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) list.tasks = list.tasks.filter(t => t.id !== action.payload.taskId);
    },
    moveTask(state, action: PayloadAction<{ sourceListId: string; destListId: string; taskId: string; newPosition: number }>) {
      const { sourceListId, destListId, taskId, newPosition } = action.payload;
      const sourceList = state.lists.find(l => l.id === sourceListId);
      const destList = state.lists.find(l => l.id === destListId);
      if (!sourceList || !destList) return;
      const taskIdx = sourceList.tasks.findIndex(t => t.id === taskId);
      if (taskIdx === -1) return;
      const [task] = sourceList.tasks.splice(taskIdx, 1);
      task.listId = destListId;
      task.position = newPosition;
      destList.tasks.splice(newPosition, 0, task);
    },
    addList(state, action: PayloadAction<List>) {
      state.lists.push(action.payload);
    },
    removeList(state, action: PayloadAction<{ listId: string }>) {
      state.lists = state.lists.filter((l) => l.id !== action.payload.listId);
    },
    updateList(state, action: PayloadAction<List>) {
      const idx = state.lists.findIndex(l => l.id === action.payload.id);
      if (idx !== -1) {
        const tasks = state.lists[idx].tasks;
        state.lists[idx] = { ...action.payload, tasks };
      }
    },
    clearCurrentBoard(state) {
      state.currentBoard = null;
      state.lists = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => { state.loading = true; })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBoard.pending, (state) => { state.loading = true; })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        state.lists = action.payload.lists;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      });
  },
});

export const {
  setLists, addTaskToList, updateTaskInList, removeTaskFromList,
  moveTask, addList, removeList, updateList, clearCurrentBoard,
} = boardsSlice.actions;
export default boardsSlice.reducer;
