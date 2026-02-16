import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';
import { fetchBoards } from '@/store/boardsSlice';
import { setCreateBoardModalOpen } from '@/store/uiSlice';
import { logout } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import BoardCard from '@/components/BoardCard';
import CreateBoardModal from '@/components/CreateBoardModal';
import { Plus, Search, LayoutGrid, LogOut, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { boards, loading } = useAppSelector((s) => s.boards);
  const { createBoardModalOpen } = useAppSelector((s) => s.ui);
  const user = useAppSelector((s) => s.auth.user);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-foreground">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} title="Profile">
              <User className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => dispatch(logout())} title="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Boards</h1>
              <p className="text-sm text-muted-foreground">Manage and collaborate on your projects</p>
            </div>
            <Button onClick={() => dispatch(setCreateBoardModalOpen(true))}>
              <Plus className="mr-2 h-4 w-4" /> New Board
            </Button>
          </div>

          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search boards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBoards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBoards.map((board, i) => (
                <BoardCard key={board.id} board={board} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LayoutGrid className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-1 text-lg font-medium text-foreground">
                {search ? 'No boards found' : 'No boards yet'}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {search ? 'Try a different search term' : 'Create your first board to get started'}
              </p>
              {!search && (
                <Button onClick={() => dispatch(setCreateBoardModalOpen(true))}>
                  <Plus className="mr-2 h-4 w-4" /> Create Board
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </main>

      <CreateBoardModal
        open={createBoardModalOpen}
        onOpenChange={(open) => dispatch(setCreateBoardModalOpen(open))}
      />
    </div>
  );
};

export default Dashboard;
