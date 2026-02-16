import React, { useState } from 'react';
import { useAppDispatch } from '@/store';
import { createBoard } from '@/store/boardsSlice';
import { setCreateBoardModalOpen } from '@/store/uiSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const BOARD_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(262, 52%, 55%)',
  'hsl(25, 95%, 53%)',
  'hsl(330, 81%, 60%)',
  'hsl(174, 72%, 40%)',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateBoardModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createBoard({ name, description, color }));
    setName('');
    setDescription('');
    setColor(BOARD_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Board Name</Label>
            <Input id="board-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="board-desc">Description (optional)</Label>
            <Textarea id="board-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this board about?" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {BOARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>Create Board</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardModal;
