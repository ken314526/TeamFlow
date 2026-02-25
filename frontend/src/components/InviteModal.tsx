import React, { useState } from 'react';
import { useAppDispatch } from '@/store';
import { addBoardMember, removeBoardMember } from '@/store/boardsSlice';
import type { Board, User } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: Board | null;
}

const InviteModal: React.FC<Props> = ({ open, onOpenChange, board }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;
    setError(null);
    try {
      await dispatch(addBoardMember({ boardId: board.id, email })).unwrap();
      setEmail('');
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any)?.message || String(error);
      setError(msg || 'Invite failed');
    }
  };

  const { toast } = useToast();

  const handleRemove = async (user: User) => {
    if (!board) return;
    try {
      await dispatch(removeBoardMember({ boardId: board.id, userId: user.id })).unwrap();
    } catch (err: any) {
      console.error('Failed to remove member', err);
      const msg = err?.message || 'Unable to remove member';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Board Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {board && board.members && board.members.length > 0 && (
            <ul className="space-y-2">
              {board.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span>{m.email}</span>
                  {board.createdBy === m.id && <span className="text-xs text-muted-foreground">(owner)</span>}
                  {board.createdBy !== m.id && (
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(m)}>
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleInvite} className="space-y-2">
            <div>
              <Label htmlFor="invite-email">Invite by email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit" disabled={!email.trim()}>Invite</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
