import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, FileText } from "lucide-react";
import { TaskDetails } from "./TaskDetails";
import { PlannerTrip } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

interface TaskCardProps {
  task: PlannerTrip;
  onDelete: () => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });
  const navigate = useNavigate();

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Use departureDate from the task object
  const departureDate = task.departureDate;
  // Purple branding
  const pillStyle = {
    backgroundColor: '#F3E8FF', // lighter purple (active nav bg)
    color: '#5B2B8C', // dark purple from logo
    fontWeight: 600,
    fontSize: '0.85rem',
    padding: '0.2rem 0.75rem',
    borderRadius: '9999px',
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    zIndex: 1,
    letterSpacing: 0.2,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on an interactive element or if the details panel is open
    if (
      e.target instanceof HTMLElement && (
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('[role="dialog"]') ||
        e.target.closest('[role="sheet"]')
      )
    ) {
      return;
    }
    navigate(`/planner_trips/${task.id}`);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={dragStyle}
        {...attributes}
        {...listeners}
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <Card className="mb-2 hover:shadow-md transition-shadow relative">
          <CardContent className="p-4">
            {/* Departure date pill */}
            {departureDate && (
              <span style={{
                backgroundColor: '#F3E8FF',
                color: '#5B2B8C',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.2rem 0.75rem',
                borderRadius: '9999px',
                display: 'inline-block',
                marginBottom: '0.5rem',
                letterSpacing: 0.2,
              }}>{
                new Date(departureDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              }</span>
            )}
            {/* Trip title */}
            <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
            {/* Description (optional, keep if you want) */}
            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            {task.links && task.links.length > 0 && (
              <div className="flex items-center gap-1 text-sm mb-2" style={{ color: '#7C3AED' }}>
                <LinkIcon className="h-4 w-4" />
                <span>{task.links.length} link{task.links.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {task.texts && task.texts.length > 0 && (
              <div className="flex items-center gap-1 text-sm" style={{ color: '#7C3AED' }}>
                <FileText className="h-4 w-4" />
                <span>{task.texts.length} note{task.texts.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDetails
        task={task}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onDelete={onDelete}
      />
    </>
  );
}
