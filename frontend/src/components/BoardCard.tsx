import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Board } from '@/types';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  board: Board;
  index: number;
}

const BoardCard: React.FC<Props> = ({ board, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/50 transition-all hover:shadow-md hover:-translate-y-0.5"
        onClick={() => navigate(`/board/${board.id}`)}
      >
        <div className="h-2" style={{ backgroundColor: board.color }} />
        <div className="p-5">
          <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors">
            {board.name}
          </h3>
          {board.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{board.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{board.members?.length || 0} members</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BoardCard;
