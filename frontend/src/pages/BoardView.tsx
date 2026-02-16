import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchBoard, clearCurrentBoard, moveTask, addList } from '@/store/boardsSlice';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import ListColumn from '@/components/ListColumn';
import TaskDetailModal from '@/components/TaskDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Plus, Users, Loader2 } from 'lucide-react';
import { tasksAPI, listsAPI } from '@/api/services';
import { joinBoard, leaveBoard } from '@/socket';
import { motion } from 'framer-motion';

const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBoard, lists, loading } = useAppSelector((s) => s.boards);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
      joinBoard(boardId);
    }
    return () => {
      if (boardId) leaveBoard(boardId);
      dispatch(clearCurrentBoard());
    };
  }, [boardId, dispatch]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    dispatch(moveTask({
      sourceListId: source.droppableId,
      destListId: destination.droppableId,
      taskId: draggableId,
      newPosition: destination.index,
    }));

    try {
      await tasksAPI.move(draggableId, {
        listId: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      console.error('Failed to move task', err);
      if (boardId) dispatch(fetchBoard(boardId));
    }
  };

  const handleAddList = async () => {
    if (!newListTitle.trim() || !boardId) return;
    try {
      const { data } = await listsAPI.create(boardId, {
        title: newListTitle.trim(),
        position: lists.length,
      });
      dispatch(addList(data));
      setNewListTitle('');
      setAddingList(false);
    } catch (err) {
      console.error('Failed to create list', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{currentBoard?.name || 'Board'}</h1>
          </div>
          {currentBoard?.members && currentBoard.members.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {currentBoard.members.slice(0, 5).map((m) => (
                  <Avatar key={m.id} className="h-7 w-7 border-2 border-background">
                    <AvatarFallback className="text-[10px] bg-secondary">
                      {m.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Users className="mr-1 h-3.5 w-3.5" /> Invite
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Board */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-x-auto p-4 scrollbar-thin"
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 items-start">
            {lists.map((list) => (
              <ListColumn key={list.id} list={list} />
            ))}

            {/* Add list */}
            <div className="w-72 flex-shrink-0">
              {addingList ? (
                <div className="rounded-xl bg-muted/50 border border-border/30 p-3 space-y-2">
                  <Input
                    autoFocus
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') { setAddingList(false); setNewListTitle(''); }
                    }}
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleAddList} disabled={!newListTitle.trim()}>Add List</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddingList(false); setNewListTitle(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start border-dashed text-muted-foreground hover:text-foreground"
                  onClick={() => setAddingList(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add another list
                </Button>
              )}
            </div>
          </div>
        </DragDropContext>
      </motion.div>

      <TaskDetailModal />
    </div>
  );
};

export default BoardView;
