import React from 'react';
import type { Task } from '@/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, GripVertical } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { useAppDispatch } from '@/store';
import { openTaskModal } from '@/store/uiSlice';

interface Props {
  task: Task;
  index: number;
}

const TaskCard: React.FC<Props> = ({ task, index }) => {
  const dispatch = useAppDispatch();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-2"
        >
          <Card
            className={`cursor-pointer border-border/50 p-3 transition-all hover:shadow-sm ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20 rotate-2' : ''
            }`}
            onClick={() => dispatch(openTaskModal(task.id))}
          >
            <div className="flex items-start gap-2">
              <div {...provided.dragHandleProps} className="mt-0.5 text-muted-foreground/50 hover:text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                {task.labels?.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {task.labels.map((label) => (
                      <Badge
                        key={label.id}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                        style={{ backgroundColor: label.color + '20', color: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {task.assignees?.length > 0 && (
                    <div className="flex -space-x-1.5">
                      {task.assignees.slice(0, 3).map((u) => (
                        <Avatar key={u.id} className="h-5 w-5 border-2 border-card">
                          <AvatarFallback className="text-[9px] bg-secondary">
                            {u.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
