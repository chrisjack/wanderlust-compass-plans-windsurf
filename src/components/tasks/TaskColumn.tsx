import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { PlannerColumn, PlannerTrip } from "@/integrations/supabase/types";
import { useDroppable } from '@dnd-kit/core';
import React, { useState, useEffect } from "react";
import { offlineStorage } from "@/lib/offlineStorage";
import { syncService } from "@/lib/syncService";

interface TaskColumnProps {
  column: PlannerColumn;
  onAddTask: () => void;
  search?: string;
  onCount?: (count: number) => void;
}

export function TaskColumn({ column, onAddTask, search, onCount }: TaskColumnProps) {
  const { user } = useAuth();
  const { setNodeRef } = useDroppable({ id: column.id });
  const [isExpanded, setIsExpanded] = useState(false);
  const [offlineTasks, setOfflineTasks] = useState<PlannerTrip[]>([]);

  // Check if this is the Archive column
  const isArchiveColumn = column.title === 'Archive';

  // Fetch offline tasks
  useEffect(() => {
    const loadOfflineTasks = async () => {
      if (!user) return;
      
      try {
        const offlineTrips = await offlineStorage.getTrips(user.id);
        const columnTrips = offlineTrips.filter(trip => trip.column_id === column.id);
        setOfflineTasks(columnTrips as PlannerTrip[]);
      } catch (error) {
        console.error('Error loading offline tasks:', error);
      }
    };

    loadOfflineTasks();
    
    // Set up change listener for offline storage updates
    const unsubscribe = offlineStorage.onChange((table) => {
      if (table === 'trips') {
        loadOfflineTasks();
      }
    });
    
    return unsubscribe;
  }, [user, column.id]);

  const { data: onlineTasks = [] } = useQuery({
    queryKey: ['planner-trips', column.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('planner_trips')
        .select(`
          *,
          trips (
            trip_name
          ),
          tags:planner_trip_tags (
            tag:planner_tags (
              id,
              name
            )
          ),
          links:planner_trip_links (
            id,
            title,
            url
          ),
          texts:planner_trip_texts (
            id,
            content
          )
        `)
        .eq('column_id', column.id)
        .eq('user_id', user.id)
        .order('departureDate', { ascending: true });

      if (error) {
        console.error('Error fetching planner trips:', error);
        throw error;
      }

      // Transform the data to match the expected structure and sort by departure date
      const transformedData = data.map(trip => ({
        ...trip,
        tags: trip.tags.map((t: any) => t.tag),
        links: trip.links,
        texts: trip.texts
      })) as PlannerTrip[];

      // Sort by departure date: closest first, nulls last
      return transformedData.sort((a, b) => {
        // If both have departure dates, sort by date
        if (a.departureDate && b.departureDate) {
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
        }
        // If only one has departure date, prioritize the one with date
        if (a.departureDate && !b.departureDate) {
          return -1;
        }
        if (!a.departureDate && b.departureDate) {
          return 1;
        }
        // If neither has departure date, maintain original order
        return 0;
      });
    },
    enabled: !!user,
  });

  // Combine online and offline tasks, prioritizing offline for duplicates
  const allTasks = React.useMemo(() => {
    const onlineTaskIds = new Set(onlineTasks.map(task => task.id));
    const offlineOnlyTasks = offlineTasks.filter(task => !onlineTaskIds.has(task.id));
    
    // Combine and sort
    const combined = [...onlineTasks, ...offlineOnlyTasks];
    
    return combined.sort((a, b) => {
      // If both have departure dates, sort by date
      if (a.departureDate && b.departureDate) {
        return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
      }
      // If only one has departure date, prioritize the one with date
      if (a.departureDate && !b.departureDate) {
        return -1;
      }
      if (!a.departureDate && b.departureDate) {
        return 1;
      }
      // If neither has departure date, maintain original order
      return 0;
    });
  }, [onlineTasks, offlineTasks]);

  // Filter tasks by search (title or tags)
  const filteredTasks = allTasks.filter(task => {
    if (!search) return true;
    const lower = search.toLowerCase();
    const inTitle = task.title?.toLowerCase().includes(lower);
    const inTags = task.tags?.some(tag => tag.name?.toLowerCase().includes(lower));
    // TODO: Add client search if client data is available
    return inTitle || inTags;
  });

  // Notify parent of count
  React.useEffect(() => {
    if (onCount) onCount(filteredTasks.length);
  }, [filteredTasks.length, onCount]);

  const handleDelete = async (taskId: string) => {
    try {
      // Use sync service for deletion
      await syncService.deleteTripOptimistic(taskId);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  };

  return (
    <div ref={setNodeRef} className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] flex flex-col">
      {isArchiveColumn && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">{filteredTasks.length} archived trips</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      
      <div className="space-y-2 flex-1">
        {isArchiveColumn && !isExpanded ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Click to view archived trips
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        )}
      </div>
      
      {!isArchiveColumn && (
        <Button className="mt-4 w-full" variant="secondary" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Trip
        </Button>
      )}
    </div>
  );
}
