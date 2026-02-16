import React, { useState } from 'react';
import type { List as ListType } from '@/types';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { tasksAPI, listsAPI } from '@/api/services';
import { useAppDispatch } from '@/store';
import { addTaskToList, updateList, removeList } from '@/store/boardsSlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  list: ListType;
}

const ListColumn: React.FC<Props> = ({ list }) => {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    try {
      const { data } = await tasksAPI.create(list.id, {
        title: newTitle.trim(),
        position: list.tasks?.length || 0,
      });
      dispatch(addTaskToList({ listId: list.id, task: data }));
      setNewTitle('');
      setAdding(false);
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleRenameList = async () => {
    if (!editTitle.trim() || editTitle === list.title) {
      setIsEditing(false);
      return;
    }
    try {
      const { data } = await listsAPI.update(list.id, { title: editTitle.trim() });
      dispatch(updateList(data));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename list', err);
    }
  };

  const handleDeleteList = async () => {
    try {
      await listsAPI.delete(list.id);
      // remove list from local state (tasks are deleted server-side)
      dispatch(removeList({ listId: list.id }));
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete list', err);
    }
  };

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-muted/50 border border-border/30">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border/20">
        {isEditing ? (
          <div className="flex-1 flex gap-1">
            <Input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameList();
                if (e.key === 'Escape') { setIsEditing(false); setEditTitle(list.title); }
              }}
              className="text-sm h-8"
            />
            <Button size="sm" onClick={handleRenameList} variant="default" className="px-2">Save</Button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-foreground flex-1">{list.title}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{list.tasks?.length || 0}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="p-2 border-b border-border/20">
        {adding ? (
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTask();
                if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
              }}
              className="text-sm h-8"
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleAddTask} disabled={!newTitle.trim()} className="flex-1">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setNewTitle(''); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-sm h-8"
            onClick={() => setAdding(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add task
          </Button>
        )}
      </div>

      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2 py-2 min-h-[200px] transition-colors rounded-lg mx-1 ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {list.tasks?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No tasks yet</p>
            ) : (
              list.tasks?.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{list.title}</strong>"? All tasks in this list ({list.tasks?.length || 0}) will also be deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteList} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListColumn;
