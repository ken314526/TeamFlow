import client from './client';
import type { Board, List, Task, Activity, Comment, PaginatedResponse } from '@/types';

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    client.post('/api/auth/login', { email, password }),
  signup: (name: string, email: string, password: string) =>
    client.post('/api/auth/signup', { name, email, password }),
  refresh: (refreshToken: string) =>
    client.post('/api/auth/refresh', { refreshToken }),
  updateProfile: (data: { name: string; avatar?: string }) =>
    client.put('/api/auth/profile', data),
};

// Boards
export const boardsAPI = {
  getAll: () => client.get<Board[]>('/api/boards'),
  getById: (id: string) => client.get<Board>(`/api/boards/${id}`),
  create: (data: { name: string; description?: string; color: string }) =>
    client.post<Board>('/api/boards', data),
  update: (id: string, data: Partial<Board>) =>
    client.put<Board>(`/api/boards/${id}`, data),
  delete: (id: string) => client.delete(`/api/boards/${id}`),
};

// Lists
export const listsAPI = {
  getByBoard: (boardId: string) => client.get<List[]>(`/api/boards/${boardId}/lists`),
  create: (boardId: string, data: { title: string; position?: number }) =>
    client.post<List>('/api/lists', { boardId, title: data.title, position: data.position ?? 0 }),
  update: (id: string, data: Partial<List>) =>
    client.put<List>(`/api/lists/${id}`, data),
  delete: (id: string) => client.delete(`/api/lists/${id}`),
  reorder: (id: string, newPosition: number) =>
    client.put(`/api/lists/${id}/reorder`, { newPosition }),
};

// Tasks
export const tasksAPI = {
  create: (listId: string, data: { title: string; description?: string; position?: number }) =>
    client.post<Task>('/api/tasks', { listId, title: data.title, description: data.description ?? '', position: data.position ?? 0 }),
  update: (id: string, data: Partial<Task>) =>
    client.put<Task>(`/api/tasks/${id}`, data),
  delete: (id: string) => client.delete(`/api/tasks/${id}`),
  move: (id: string, data: { listId: string; position: number }) =>
    client.put<Task>(`/api/tasks/${id}/move`, data),
  search: (query: string) => client.get<Task[]>(`/api/tasks/search?query=${query}`),
  assign: (id: string, userId: string) =>
    client.post(`/api/tasks/${id}/assign`, { userId }),
  unassign: (id: string, userId: string) =>
    client.delete(`/api/tasks/${id}/assign/${userId}`),
};

// Members
export const membersAPI = {
  add: (boardId: string, email: string) =>
    client.post(`/api/boards/${boardId}/members`, { email }),
  remove: (boardId: string, userId: string) =>
    client.delete(`/api/boards/${boardId}/members/${userId}`),
};

// Activity
export const activityAPI = {
  getByBoard: (boardId: string, page = 1, limit = 20) =>
    client.get<PaginatedResponse<Activity>>(`/api/boards/${boardId}/activity?page=${page}&limit=${limit}`),
};

// Comments
export const commentsAPI = {
  getByTask: (taskId: string) =>
    client.get<Comment[]>(`/api/tasks/${taskId}/comments`),
  create: (taskId: string, content: string) =>
    client.post<Comment>(`/api/tasks/${taskId}/comments`, { content }),
};
