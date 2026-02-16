import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { closeTaskModal } from '@/store/uiSlice';
import { updateTaskInList, removeTaskFromList } from '@/store/boardsSlice';
import { tasksAPI, commentsAPI } from '@/api/services';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Trash2, Send, X, CheckCircle2, Circle } from 'lucide-react';
import type { Task, Comment } from '@/types';

const TaskDetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { taskModalOpen, selectedTaskId } = useAppSelector((s) => s.ui);
  const lists = useAppSelector((s) => s.boards.lists);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const task = selectedTaskId
    ? lists.flatMap((l) => l.tasks).find((t) => t.id === selectedTaskId)
    : null;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setIsCompleted(!!task.completed);
      commentsAPI.getByTask(task.id).then(({ data }) => setComments(data)).catch(() => {});
    }
  }, [task?.id]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    setSaving(true);
    try {
      const { data } = await tasksAPI.update(task.id, { title, description });
      dispatch(updateTaskInList(data));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task', err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await tasksAPI.delete(task.id);
      dispatch(removeTaskFromList({ listId: task.listId, taskId: task.id }));
      dispatch(closeTaskModal());
    } catch (err) {
      console.error('Failed to delete task', err);
    }
    setShowDeleteConfirm(false);
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    try {
      const { data } = await commentsAPI.create(task.id, newComment.trim());
      setComments((prev) => [...prev, data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const listName = task ? lists.find((l) => l.id === task.listId)?.title : '';

  return (
    <>
      <Dialog open={taskModalOpen} onOpenChange={(open) => { if (!open) dispatch(closeTaskModal()); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg">Task Details</DialogTitle>
                {listName && <Badge variant="secondary" className="text-xs">{listName}</Badge>}
              </div>
            </div>
          </DialogHeader>

          {task && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Title</Label>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-xs">
                      Edit
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-border/30 p-3 bg-muted/30">
                    <button
                      onClick={async () => {
                        if (!task) return;
                        const newVal = !isCompleted;
                        setIsCompleted(newVal);
                        try {
                          const { data } = await tasksAPI.update(task.id, { completed: newVal });
                          dispatch(updateTaskInList(data));
                        } catch (err) {
                          console.error('Failed to update completion', err);
                          setIsCompleted(!newVal);
                        }
                      }}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <p className={`text-sm font-medium flex-1 ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {title}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={4}
                  disabled={!isEditing}
                  className={!isEditing ? 'cursor-not-allowed opacity-70' : ''}
                />
              </div>

              {task.assignees?.length > 0 && (
                <div className="space-y-2">
                  <Label>Assignees</Label>
                  <div className="flex flex-wrap gap-2">
                    {task.assignees.map((u) => (
                      <div key={u.id} className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">{u.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-secondary-foreground">{u.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.labels?.length > 0 && (
                <div className="space-y-2">
                  <Label>Labels</Label>
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map((label) => (
                      <Badge key={label.id} style={{ backgroundColor: label.color + '20', color: label.color }}>
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => { setIsEditing(false); setTitle(task.title); setDescription(task.description || ''); }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="destructive" size="sm" className="w-full" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Task
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Comments</Label>
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No comments yet</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="rounded-lg bg-muted/50 p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">{c.userId?.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{c.userId?.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{c.content}</p>
                    </div>
                  ))
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                    className="text-sm"
                  />
                  <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{title}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskDetailModal;
