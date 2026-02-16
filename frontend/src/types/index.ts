export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdBy: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  position: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  position: number;
  assignees: User[];
  labels: Label[];
  completed?: boolean;
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Activity {
  id: string;
  boardId: string;
  taskId?: string;
  userId: string;
  user: User;
  action: string;
  details: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface BoardsState {
  boards: Board[];
  currentBoard: Board | null;
  lists: List[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  searchQuery: string;
  taskModalOpen: boolean;
  selectedTaskId: string | null;
  createBoardModalOpen: boolean;
  sidebarOpen: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
