import React, { useEffect, useState } from 'react';
import { Gantt, Task as GanttTaskType, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import MDEditor from '@uiw/react-md-editor';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ViewDay,
  ViewWeek,
  CalendarMonth,
  Refresh,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { Task, TaskHierarchy } from '../../services/taskService';
import TaskEditDialog from '../../components/TaskEditDialog';

interface GanttTask extends GanttTaskType {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
}

interface GanttTaskData extends GanttTask {
  originalTask: Task;
}

const GanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<GanttTaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [expandAll, setExpandAll] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GanttTaskData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const convertToGanttTasks = (taskHierarchy: TaskHierarchy): GanttTaskData[] => {
    const result: GanttTaskData[] = [];
    
    const convertTask = (task: TaskHierarchy, parentId?: string) => {
      const startTime = task.task.start_time ? new Date(task.task.start_time) : new Date();
      const endTime = task.task.due_date ? new Date(task.task.due_date) : new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
      
      const ganttTask: GanttTaskData = {
        id: task.task.id.toString(),
        name: task.task.title,
        start: startTime,
        end: endTime,
        progress: task.task.progress,
        dependencies: task.task.parent_id ? [task.task.parent_id.toString()] : undefined,
        type: task.sub_tasks && task.sub_tasks.length > 0 ? 'project' : 'task',
        hideChildren: !expandAll,
        styles: {
          backgroundColor: getTaskColor(task.task.priority),
          progressColor: getProgressColor(task.task.priority),
        },
        originalTask: task.task
      };
      
      result.push(ganttTask);
      
      if (task.sub_tasks) {
        task.sub_tasks.forEach(subTask => convertTask(subTask, task.task.id.toString()));
      }
    };
    
    convertTask(taskHierarchy);
    return result;
  };

  const getTaskColor = (priority: string): string => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return '#ffcdd2';
      case 'MEDIUM':
        return '#fff9c4';
      case 'LOW':
        return '#c8e6c9';
      default:
        return '#e0e0e0';
    }
  };

  const getProgressColor = (priority: string): string => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return '#e53935';
      case 'MEDIUM':
        return '#fdd835';
      case 'LOW':
        return '#43a047';
      default:
        return '#757575';
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:31858/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await response.json();
      
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

  const handleTaskClick = (task: GanttTaskType) => {
    const clickedTask = tasks.find(t => t.id === task.id);
    if (clickedTask) {
      setSelectedTask(clickedTask);
      setIsEditDialogOpen(true);
    }
  };

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      const response = await fetch(`http://localhost:31858/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setSnackbar({
        open: true,
        message: '작업이 성공적으로 수정되었습니다.',
        severity: 'success'
      });

      // 작업 목록 새로고침
      fetchTasks();
    } catch (err) {
      setSnackbar({
        open: true,
        message: '작업 수정에 실패했습니다.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleExpandToggle = () => {
    setExpandAll(!expandAll);
    setTasks(tasks.map(task => ({
      ...task,
      hideChildren: expandAll,
    })));
  };

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
    <Paper sx={{ p: 3, m: 2, borderRadius: 2, boxShadow: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            프로젝트 타임라인
          </Typography>
          <Tooltip title="새로고침">
            <IconButton onClick={fetchTasks} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title={expandAll ? "모두 접기" : "모두 펼치기"}>
            <IconButton onClick={handleExpandToggle} size="small">
              {expandAll ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <Tooltip title="일별 보기">
              <ToggleButton value={ViewMode.Day}>
                <ViewDay />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="주별 보기">
              <ToggleButton value={ViewMode.Week}>
                <ViewWeek />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="월별 보기">
              <ToggleButton value={ViewMode.Month}>
                <CalendarMonth />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Stack direction="row" spacing={1}>
            <Chip
              label="높은 우선순위"
              size="small"
              sx={{ bgcolor: '#ffcdd2' }}
            />
            <Chip
              label="중간 우선순위"
              size="small"
              sx={{ bgcolor: '#fff9c4' }}
            />
            <Chip
              label="낮은 우선순위"
              size="small"
              sx={{ bgcolor: '#c8e6c9' }}
            />
          </Stack>
        </Stack>
      </Box>

      <Paper 
        elevation={1} 
        sx={{ 
          height: 'calc(100vh - 300px)', 
          p: 2,
          bgcolor: '#f5f5f5',
          borderRadius: 1
        }}
      >
        {tasks.length > 0 ? (
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            listCellWidth=""
            columnWidth={60}
            barCornerRadius={4}
            barProgressColor="#1976d2"
            barProgressSelectedColor="#2196f3"
            handleWidth={10}
            todayColor="rgba(252, 248, 227, 0.5)"
            projectProgressColor="#1976d2"
            projectProgressSelectedColor="#2196f3"
            rtl={false}
            onDoubleClick={handleTaskClick}
          />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="h6" color="text.secondary">
              표시할 작업이 없습니다
            </Typography>
          </Box>
        )}
      </Paper>

      <TaskEditDialog
        open={isEditDialogOpen}
        task={selectedTask?.originalTask || null}
        tasks={tasks.map(t => t.originalTask)}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleTaskSave}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default GanttChart;
