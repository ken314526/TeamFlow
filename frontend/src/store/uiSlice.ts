import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '@/types';

const initialState: UIState = {
  searchQuery: '',
  taskModalOpen: false,
  selectedTaskId: null,
  createBoardModalOpen: false,
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    openTaskModal(state, action: PayloadAction<string>) {
      state.taskModalOpen = true;
      state.selectedTaskId = action.payload;
    },
    closeTaskModal(state) {
      state.taskModalOpen = false;
      state.selectedTaskId = null;
    },
    setCreateBoardModalOpen(state, action: PayloadAction<boolean>) {
      state.createBoardModalOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setSearchQuery, openTaskModal, closeTaskModal, setCreateBoardModalOpen, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
