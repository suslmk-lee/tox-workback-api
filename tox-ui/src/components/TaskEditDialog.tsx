import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Stack,
  LinearProgress,
  Typography,
  Autocomplete,
  Box,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Task, TaskType, TaskStatus, TaskPriority } from '../services/taskService';
import { User, getUsers } from '../services/userService';
import MDEditor from '@uiw/react-md-editor';

interface TaskEditDialogProps {
  open: boolean;
  task: Task | null;
  tasks: Task[];
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  open,
  task,
  tasks,
  onClose,
  onSave,
}) => {
  const [editedTask, setEditedTask] = React.useState<Task | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedParentTask, setSelectedParentTask] = React.useState<Task | null>(null);

  React.useEffect(() => {
    if (task) {
      setEditedTask({
        ...task,
        progress: task.progress || 0,
        estimated_hours: task.estimated_hours || 0,
      });
      
      // 상위 작업이 있다면 선택
      if (task.parent_id) {
        const parentTask = tasks.find(t => t.id === task.parent_id);
        setSelectedParentTask(parentTask || null);
      } else {
        setSelectedParentTask(null);
      }
    }
  }, [task, tasks]);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await getUsers();
        setUsers(usersList);
        
        // 현재 선택된 담당자가 있다면 해당 사용자 선택
        if (editedTask?.assignee_id) {
          const assignee = usersList.find(user => user.id === editedTask.assignee_id);
          setSelectedUser(assignee || null);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open, editedTask?.assignee_id]);

  if (!editedTask) return null;

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
    }
    onClose();
  };

  // 현재 작업의 하위 작업들을 찾는 함수
  const findChildTasks = (taskId: string): string[] => {
    const childIds: string[] = [];
    const findChildren = (id: string) => {
      tasks.forEach(t => {
        if (t.parent_id === id) {
          childIds.push(t.id);
          findChildren(t.id);
        }
      });
    };
    findChildren(taskId);
    return childIds;
  };

  // 선택 가능한 상위 작업 목록 필터링
  const availableParentTasks = tasks.filter(t => {
    // 자기 자신은 제외
    if (editedTask && t.id === editedTask.id) return false;
    // 현재 작업의 하위 작업들은 제외
    if (editedTask && findChildTasks(editedTask.id).includes(t.id)) return false;
    return true;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>작업 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="제목"
                value={editedTask?.title || ''}
                onChange={(e) =>
                  setEditedTask(prev =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                설명
              </Typography>
              <Box data-color-mode="light">
                <MDEditor
                  value={editedTask?.description || ''}
                  onChange={(value) =>
                    setEditedTask(prev =>
                      prev ? { ...prev, description: value || '' } : null
                    )
                  }
                  height={200}
                  preview="edit"
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>상태</InputLabel>
                <Select
                  value={editedTask.status || 'TODO'}
                  label="상태"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="TODO">할 일</MenuItem>
                  <MenuItem value="IN_PROGRESS">진행 중</MenuItem>
                  <MenuItem value="DONE">완료</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={editedTask.priority || 'MEDIUM'}
                  label="우선순위"
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <MenuItem value="HIGH">높음</MenuItem>
                  <MenuItem value="MEDIUM">중간</MenuItem>
                  <MenuItem value="LOW">낮음</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Autocomplete
            value={selectedParentTask}
            onChange={(event, newValue) => {
              setSelectedParentTask(newValue);
              handleChange('parent_id', newValue?.id);
            }}
            options={availableParentTasks}
            getOptionLabel={(option) => `#${option.id} ${option.title}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="상위 작업"
                placeholder="상위 작업을 선택하세요"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Typography>
                  #{option.id} {option.title}
                </Typography>
              </li>
            )}
          />

          <Autocomplete
            value={selectedUser}
            onChange={(event, newValue) => {
              setSelectedUser(newValue);
              handleChange('assignee_id', newValue?.id);
            }}
            options={users}
            getOptionLabel={(option) => `${option.name} (${option.department})`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="담당자"
                placeholder="담당자를 선택하세요"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Typography>
                  {option.name} - {option.department} ({option.position})
                </Typography>
              </li>
            )}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DateTimePicker
                  label="시작 시간"
                  value={editedTask.start_time ? new Date(editedTask.start_time) : null}
                  onChange={(date) => handleChange('start_time', date?.toISOString())}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="마감 시간"
                  value={editedTask.due_date ? new Date(editedTask.due_date) : null}
                  onChange={(date) => handleChange('due_date', date?.toISOString())}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              진행률: {editedTask.progress || 0}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={editedTask.progress || 0}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <TextField
              type="number"
              label="진행률"
              value={editedTask.progress || 0}
              onChange={(e) => handleChange('progress', Math.min(100, Math.max(0, Number(e.target.value))))}
              inputProps={{ min: 0, max: 100 }}
            />
          </Stack>

          <TextField
            type="number"
            label="예상 소요 시간 (시간)"
            value={editedTask.estimated_hours || 0}
            onChange={(e) => handleChange('estimated_hours', Math.max(0, Number(e.target.value)))}
            inputProps={{ min: 0 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog;
