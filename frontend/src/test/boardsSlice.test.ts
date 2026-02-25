import boardsReducer, { updateBoard } from '@/store/boardsSlice';
import type { BoardsState, Board } from '@/types';

describe('boardsSlice reducers', () => {
  const initialState: BoardsState = {
    boards: [],
    currentBoard: { id: '1', name: 'Test', color: '', createdBy: 'u', members: [], createdAt: '', updatedAt: '' },
    lists: [],
    loading: false,
    error: null,
  };

  it('updateBoard should replace currentBoard when id matches', () => {
    const updated: Board = { ...initialState.currentBoard!, name: 'New name' };
    const newState = boardsReducer(initialState, updateBoard(updated));
    expect(newState.currentBoard).toEqual(updated);
  });

  it('updateBoard should ignore if ids differ', () => {
    const other: Board = { ...initialState.currentBoard!, id: '2', name: 'Other' };
    const newState = boardsReducer(initialState, updateBoard(other));
    expect(newState.currentBoard).toEqual(initialState.currentBoard);
  });

  it('addBoardMember.fulfilled should update currentBoard and boards list', () => {
    const updatedBoard: Board = { ...initialState.currentBoard!, members: [{ id: 'u2', email: 'foo', name: 'Foo' }] };
    const prevState: BoardsState = { ...initialState, boards: [initialState.currentBoard!] };
    const newState = boardsReducer(prevState, {
      type: 'boards/addMember/fulfilled',
      payload: updatedBoard,
    });
    expect(newState.currentBoard).toEqual(updatedBoard);
    expect(newState.boards[0]).toEqual(updatedBoard);
  });

  it('removeBoardMember.fulfilled should update currentBoard and boards list', () => {
    const updatedBoard: Board = { ...initialState.currentBoard!, members: [] };
    const prevState: BoardsState = { ...initialState, boards: [initialState.currentBoard!] };
    const newState = boardsReducer(prevState, {
      type: 'boards/removeMember/fulfilled',
      payload: updatedBoard,
    });
    expect(newState.currentBoard).toEqual(updatedBoard);
    expect(newState.boards[0]).toEqual(updatedBoard);
  });

  it('removeBoardMember.rejected should populate error message', () => {
    const prevState: BoardsState = { ...initialState, boards: [initialState.currentBoard!] };
    const errorMsg = 'Cannot remove board owner';
    const newState = boardsReducer(prevState, {
      type: 'boards/removeMember/rejected',
      payload: errorMsg,
    });
    expect(newState.error).toBe(errorMsg);
  });

  it('addTaskToList action should insert task correctly', () => {
    const list = { id: 'l1', title: 'List', position: 0, tasks: [] } as any;
    const prevState: BoardsState = { ...initialState, lists: [list] };
    const task = { id: 't1', listId: 'l1', title: 'Task' } as any;
    const newState = boardsReducer(prevState, {
      type: 'boards/addTaskToList',
      payload: { listId: 'l1', task },
    });
    expect(newState.lists[0].tasks).toEqual([task]);
  });

  it('moveTask action should relocate a task', () => {
    const task = { id: 't1', listId: 'l1', position: 0 } as any;
    const list1 = { id: 'l1', tasks: [task] } as any;
    const list2 = { id: 'l2', tasks: [] } as any;
    const prevState: BoardsState = { ...initialState, lists: [list1, list2] };
    const payload = { sourceListId: 'l1', destListId: 'l2', taskId: 't1', newPosition: 0 };
    const newState = boardsReducer(prevState, { type: 'boards/moveTask', payload });
    expect(newState.lists[0].tasks).toHaveLength(0);
    expect(newState.lists[1].tasks[0].id).toBe('t1');
  });

  it('removeList action should delete the list', () => {
    const list = { id: 'l1', tasks: [] } as any;
    const prevState: BoardsState = { ...initialState, lists: [list] };
    const newState = boardsReducer(prevState, { type: 'boards/removeList', payload: { listId: 'l1' } });
    expect(newState.lists).toHaveLength(0);
  });

  it('addTaskToList should not duplicate existing task', () => {
    const task = { id: 't1', listId: 'l1', title: 'Task' } as any;
    const list = { id: 'l1', tasks: [task] } as any;
    const prevState: BoardsState = { ...initialState, lists: [list] };
    const newState = boardsReducer(prevState, { type: 'boards/addTaskToList', payload: { listId: 'l1', task } });
    expect(newState.lists[0].tasks).toHaveLength(1);
  });

  it('addList should ignore duplicate list', () => {
    const list = { id: 'l1', tasks: [] } as any;
    const prevState: BoardsState = { ...initialState, lists: [list] };
    const newState = boardsReducer(prevState, { type: 'boards/addList', payload: list });
    expect(newState.lists).toHaveLength(1);
  });

  it('removeTaskFromList should remove correct item', () => {
    const task = { id: 't1', listId: 'l1' } as any;
    const list = { id: 'l1', tasks: [task] } as any;
    const prevState: BoardsState = { ...initialState, lists: [list] };
    const newState = boardsReducer(prevState, {
      type: 'boards/removeTaskFromList',
      payload: { listId: 'l1', taskId: 't1' },
    });
    expect(newState.lists[0].tasks).toHaveLength(0);
  });
});