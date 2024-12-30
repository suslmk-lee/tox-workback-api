import React, { useEffect, useState } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Box, Typography, CircularProgress } from '@mui/material';
import { TaskHierarchy } from '../../types/task';

interface GanttTask extends Task {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
}

const GanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertToGanttTasks = (taskHierarchy: TaskHierarchy): GanttTask[] => {
    const result: GanttTask[] = [];
    
    const convertTask = (task: TaskHierarchy, parentId?: string) => {
      const startTime = task.task.start_time ? new Date(task.task.start_time) : new Date();
      const endTime = task.task.due_date ? new Date(task.task.due_date) : new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
      
      const ganttTask: GanttTask = {
        id: task.task.id.toString(),
        name: task.task.title,
        start: startTime,
        end: endTime,
        progress: task.task.progress,
        dependencies: task.task.parent_id ? [task.task.parent_id.toString()] : undefined,
        type: task.sub_tasks && task.sub_tasks.length > 0 ? 'project' : 'task',
        hideChildren: false,
      };
      
      result.push(ganttTask);
      
      if (task.sub_tasks) {
        task.sub_tasks.forEach(subTask => convertTask(subTask, task.task.id.toString()));
      }
    };
    
    convertTask(taskHierarchy);
    return result;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:31858/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasksData = await response.json();
        
        // Get hierarchy for each root task
        const hierarchyPromises = tasksData
          .filter((task: any) => !task.parent_id)
          .map((task: any) => 
            fetch(`http://localhost:31858/api/tasks/hierarchy/${task.id}`)
              .then(res => res.json())
          );
        
        const hierarchies = await Promise.all(hierarchyPromises);
        const allGanttTasks = hierarchies.flatMap(convertToGanttTasks);
        
        setTasks(allGanttTasks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Task Gantt Chart
      </Typography>
      <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            viewMode={ViewMode.Day}
            listCellWidth=""
            columnWidth={60}
          />
        ) : (
          <Typography>No tasks available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default GanttChart;
