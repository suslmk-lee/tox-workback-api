import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  LinearProgress,
  Autocomplete,
} from '@mui/material';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import ko from 'date-fns/locale/ko';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { Task, TaskType, TaskStatus, TaskPriority, getTasks, createTask } from '../services/taskService';
import { logout } from '../services/authService';
import TaskEditDialog from '../components/TaskEditDialog';
import { User, getUsers } from '../services/userService';
import MDEditor from '@uiw/react-md-editor';

const DATE_FORMAT = 'yyyy-MM-dd HH:mm';

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'TODO':
      return 'default';
    case 'IN_PROGRESS':
      return 'primary';
    case 'DONE':
      return 'success';
    case 'BLOCKED':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case 'TODO':
      return '할 일';
    case 'IN_PROGRESS':
      return '진행 중';
    case 'DONE':
      return '완료';
    case 'BLOCKED':
      return '차단됨';
    default:
      return status;
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'LOW':
      return 'info';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'error';
    case 'CRITICAL':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityText = (priority: TaskPriority) => {
  switch (priority) {
    case 'LOW':
      return '낮음';
    case 'MEDIUM':
      return '보통';
    case 'HIGH':
      return '높음';
    case 'CRITICAL':
      return '긴급';
    default:
      return priority;
  }
};

const getTypeText = (type: TaskType) => {
  switch (type) {
    case 'BUG':
      return '버그';
    case 'FEATURE':
      return '기능';
    case 'IMPROVEMENT':
      return '개선';
    case 'TASK':
      return '작업';
    default:
      return type;
  }
};

const formatDate = (date: string) => {
  try {
    return format(new Date(date), DATE_FORMAT, { locale: ko });
  } catch {
    return '';
  }
};

const TaskListPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedParentTask, setSelectedParentTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'TASK' as TaskType,
    priority: 'MEDIUM' as TaskPriority,
    assignee_id: undefined as number | undefined,
    parent_id: undefined as string | undefined,
    start_time: undefined as string | undefined,
    due_date: undefined as string | undefined,
    estimated_hours: undefined as number | undefined,
  });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      setError(error.message);
      if (error.message.includes('인증')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadTasks();
  }, [navigate]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await getUsers();
        setUsers(usersList);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddTask = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTask({
      title: '',
      description: '',
      type: 'TASK',
      priority: 'MEDIUM',
      assignee_id: undefined,
      parent_id: undefined,
      start_time: undefined,
      due_date: undefined,
      estimated_hours: undefined,
    });
    setSelectedUser(null);
    setSelectedParentTask(null);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      await createTask(newTask);
      await loadTasks();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating task:', error);
      setError(error.message);
      if (error.message.includes('인증')) {
        navigate('/login');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleTaskClick = async (task: Task) => {
    try {
      const response = await fetch(`http://localhost:31858/api/tasks/hierarchy/${task.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task details');
      }
      const taskHierarchy = await response.json();
      setSelectedTask(taskHierarchy.task);
      setOpenEditDialog(true);
    } catch (err) {
      setError('작업 정보를 불러오는데 실패했습니다.');
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

      // 작업 목록 새로고침
      await loadTasks();
      setOpenEditDialog(false);
    } catch (err) {
      setError('작업 수정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          작업 목록
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            sx={{ mr: 2 }}
          >
            새 작업
          </Button>
          <IconButton onClick={handleLogout} color="inherit">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2}>
        <List>
          {tasks.map((task) => {
            const assignedUser = users.find(user => user.id === task.assignee_id);
            const parentTask = tasks.find(t => t.id === task.parent_id);
            return (
              <ListItem
                key={task.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  py: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => handleTaskClick(task)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 2 }}>
                    #{task.id}
                  </Typography>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {task.title}
                  </Typography>
                  <Chip
                    label={getTypeText(task.type)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={getStatusText(task.status)}
                    color={getStatusColor(task.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={getPriorityText(task.priority)}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Box data-color-mode="light">
                    <MDEditor.Markdown source={task.description} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
                  {parentTask && (
                    <Typography variant="body2">
                      상위 작업: #{parentTask.id} {parentTask.title}
                    </Typography>
                  )}
                  {assignedUser && (
                    <Typography variant="body2">
                      담당자: {assignedUser.name} ({assignedUser.department})
                    </Typography>
                  )}
                  {task.start_time && (
                    <Typography variant="body2">
                      시작: {formatDate(task.start_time)}
                    </Typography>
                  )}
                  {task.due_date && (
                    <Typography variant="body2">
                      마감: {formatDate(task.due_date)}
                    </Typography>
                  )}
                  {task.estimated_hours && (
                    <Typography variant="body2">
                      예상 시간: {task.estimated_hours}시간
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    진행률: {task.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </ListItem>
            );
          })}
          {tasks.length === 0 && (
            <ListItem>
              <ListItemText
                primary="작업이 없습니다."
                secondary="새 작업을 추가해보세요."
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>새 작업 추가</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="제목"
                fullWidth
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                설명
              </Typography>
              <Box data-color-mode="light">
                <MDEditor
                  value={newTask.description}
                  onChange={(value) => setNewTask({ ...newTask, description: value || '' })}
                  height={200}
                  preview="edit"
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>유형</InputLabel>
                <Select
                  value={newTask.type}
                  label="유형"
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as TaskType })}
                >
                  <MenuItem value="BUG">버그</MenuItem>
                  <MenuItem value="FEATURE">기능</MenuItem>
                  <MenuItem value="IMPROVEMENT">개선</MenuItem>
                  <MenuItem value="TASK">작업</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={newTask.priority}
                  label="우선순위"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                >
                  <MenuItem value="LOW">낮음</MenuItem>
                  <MenuItem value="MEDIUM">보통</MenuItem>
                  <MenuItem value="HIGH">높음</MenuItem>
                  <MenuItem value="CRITICAL">긴급</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                value={selectedParentTask}
                onChange={(event, newValue) => {
                  setSelectedParentTask(newValue);
                  setNewTask(prev => ({ ...prev, parent_id: newValue?.id }));
                }}
                options={tasks}
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
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                value={selectedUser}
                onChange={(event, newValue) => {
                  setSelectedUser(newValue);
                  setNewTask(prev => ({ ...prev, assignee_id: newValue?.id }));
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
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                  label="시작 시간"
                  value={newTask.start_time ? new Date(newTask.start_time) : null}
                  onChange={(date) => setNewTask({ ...newTask, start_time: date?.toISOString() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateTimePicker
                  label="마감 기한"
                  value={newTask.due_date ? new Date(newTask.due_date) : null}
                  onChange={(date) => setNewTask({ ...newTask, due_date: date?.toISOString() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="예상 시간 (시간)"
                fullWidth
                value={newTask.estimated_hours || ''}
                onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button
            onClick={handleCreateTask}
            variant="contained"
            disabled={creating}
          >
            {creating ? <CircularProgress size={24} /> : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      <TaskEditDialog
        open={openEditDialog}
        task={selectedTask}
        tasks={tasks}
        onClose={() => setOpenEditDialog(false)}
        onSave={handleTaskSave}
      />
    </Container>
  );
};

export default TaskListPage;
