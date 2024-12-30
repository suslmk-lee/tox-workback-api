import React, { useState, useEffect, useMemo } from 'react';
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
  InputAdornment
} from '@mui/material';
import {
  AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ko from 'date-fns/locale/ko';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Task, TaskType, TaskStatus, TaskPriority, getTasks, createTask, getTypeText, CreateTaskRequest, updateTask } from '../services/taskService';
import { logout } from '../services/authService';
import TaskEditDialog from '../components/TaskEditDialog';
import { User, getUsers } from '../services/userService';
import MDEditor from '@uiw/react-md-editor';
import { formatToKST, toUTCMillis, fromUTCMillis, isOverdue, toStartOfDay, formatDate } from '../utils/dateUtils';
import SearchIcon from '@mui/icons-material/Search';

const getTypeColor = (type: TaskType) => {
  switch (type) {
    case '1': // MainTask
      return '#1976d2';  // 파란색
    case '2': // 기획&설계
      return '#9c27b0';  // 보라색
    case '3': // 버그
      return '#d32f2f';  // 빨간색
    case '4': // 샘플
      return '#ed6c02';  // 주황색
    case '5': // 개발
      return '#2e7d32';  // 초록색
    case '6': // 지원
      return '#0288d1';  // 하늘색
    case '7': // 보안
      return '#c2185b';  // 분홍색
    case '8': // 기술검토
      return '#7b1fa2';  // 진한 보라색
    case '9': // 리소스
      return '#1565c0';  // 진한 파란색
    case '10': // 테스트
      return '#558b2f';  // 연두색
    case '11': // 문서화
      return '#00796b';  // 청록색
    case '12': // 관리
      return '#5d4037';  // 갈색
    default:
      return '#757575';  // 회색
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'TODO':
      return '#757575';  // 회색
    case 'IN_PROGRESS':
      return '#1976d2';  // 파란색
    case 'DONE':
      return '#2e7d32';  // 초록색
    default:
      return '#757575';  // 회색
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'LOW':
      return '#757575';  // 회색
    case 'MEDIUM':
      return '#1976d2';  // 파란색
    case 'HIGH':
      return '#ed6c02';  // 주황색
    case 'CRITICAL':
      return '#d32f2f';  // 빨간색
    default:
      return '#757575';  // 회색
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
    default:
      return status;
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

const taskTypeOptions = {
  '1': 'MainTask',
  '2': '기획&설계',
  '3': '버그',
  '4': '샘플',
  '5': '개발',
  '6': '지원',
  '7': '보안',
  '8': '기술검토',
  '9': '리소스',
  '10': '테스트',
  '11': '문서화',
  '12': '관리'
};

const priorityOptions = {
  'LOW': '낮음',
  'MEDIUM': '보통',
  'HIGH': '높음',
  'CRITICAL': '긴급'
};

const TaskListPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    type: '12',
    priority: 'MEDIUM',
    status: 'TODO',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedParentTask, setSelectedParentTask] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTasks();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
        console.error('Received invalid tasks data:', data);
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      setError(error.message);
      if (error.message === 'Unauthorized') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersList = await getUsers();
      if (Array.isArray(usersList)) {
        setUsers(usersList);
      } else {
        setUsers([]);
        console.error('Received invalid users data:', usersList);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesUser = !selectedUser || task.assignee_id === selectedUser;
      const matchesParent = !selectedParentTask || task.parent_id === selectedParentTask;

      return matchesSearch && matchesUser && matchesParent;
    });
  }, [tasks, searchQuery, selectedUser, selectedParentTask]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddTask = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewTask({
      title: '',
      description: '',
      type: '12',
      priority: 'MEDIUM',
      status: 'TODO',
    });
  };

  const handleChange = (field: keyof Task, value: any) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateTask = async () => {
    if (!newTask.title) {
      setError('제목을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const taskToCreate: CreateTaskRequest = {
        title: newTask.title || '',
        description: newTask.description || '',
        type: newTask.type || '12',
        priority: newTask.priority || 'MEDIUM',
        status: 'TODO',
        start_time: newTask.start_time || toStartOfDay(new Date()),
        due_date: newTask.due_date,
        estimated_hours: typeof newTask.estimated_hours === 'number' ? newTask.estimated_hours : undefined,
        assignee_id: typeof newTask.assignee_id === 'number' ? newTask.assignee_id : undefined,
        parent_id: typeof newTask.parent_id === 'number' ? newTask.parent_id : undefined,
      };

      await createTask(taskToCreate);
      await loadTasks();
      handleCloseCreateDialog();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || '일감 생성 중 오류가 발생했습니다.');
      if (err.message === 'Unauthorized') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskSave = async (updatedTask: Partial<Task>) => {
    try {
      setLoading(true);
      setError('');

      if (!selectedTask) {
        // 새 일감 생성
        await createTask(updatedTask as CreateTaskRequest);
      } else {
        // 기존 일감 수정
        await updateTask(selectedTask.id, updatedTask);
      }

      await loadTasks();
      setSelectedTask(null);
      setOpenCreateDialog(false);
    } catch (error: any) {
      console.error('Error updating task:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.department})` : `사용자 #${userId}`;
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
    <Container maxWidth="xl">
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

      <Paper sx={{ mt: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">일감 목록</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
          >
            일감 추가
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목 또는 설명으로 검색"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>담당자</InputLabel>
                <Select
                  value={selectedUser ?? ''}
                  onChange={(e) => setSelectedUser(e.target.value === '' ? null : Number(e.target.value))}
                  label="담당자"
                >
                  <MenuItem value="">
                    <em>전체</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>상위일감</InputLabel>
                <Select
                  value={selectedParentTask ?? ''}
                  onChange={(e) => setSelectedParentTask(e.target.value === '' ? null : Number(e.target.value))}
                  label="상위일감"
                >
                  <MenuItem value="">
                    <em>전체</em>
                  </MenuItem>
                  {tasks.map((task) => (
                    <MenuItem key={task.id} value={task.id}>
                      #{task.id} {task.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  cursor: 'pointer',
                  backgroundColor: isOverdue(task.due_date) ? '#fff4f4' : 'background.paper',
                  border: isOverdue(task.due_date) ? '1px solid #ffcdd2' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: isOverdue(task.due_date) ? '#ffe7e7' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                onClick={() => handleTaskClick(task)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                    #{task.id}
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ flexGrow: 1 }}>
                    {task.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getTypeText(task.type)}
                    size="small"
                    sx={{ backgroundColor: getTypeColor(task.type), color: 'white' }}
                  />
                  <Chip
                    label={task.status}
                    size="small"
                    sx={{ backgroundColor: getStatusColor(task.status as TaskStatus), color: 'white' }}
                  />
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{ backgroundColor: getPriorityColor(task.priority as TaskPriority), color: 'white' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 'auto' }}>
                  {task.parent_id && (
                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>상위일감:</span>
                      <span style={{ fontWeight: 'bold' }}>#{task.parent_id}</span>
                    </Typography>
                  )}
                  {task.assignee_id && (
                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>담당자:</span>
                      <span style={{ fontWeight: 'bold' }}>{getUserName(task.assignee_id)}</span>
                    </Typography>
                  )}
                  {(task.start_time || task.due_date) && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {task.start_time && (
                        <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span>시작일:</span>
                          <span style={{ fontWeight: 'bold' }}>{formatDate(task.start_time)}</span>
                        </Typography>
                      )}
                      {task.due_date && (
                        <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span>마감일:</span>
                          <span style={{ 
                            fontWeight: 'bold', 
                            color: isOverdue(task.due_date) ? '#d32f2f' : 'inherit'
                          }}>
                            {formatDate(task.due_date)}
                          </span>
                        </Typography>
                      )}
                    </Box>
                  )}
                  {task.estimated_hours && (
                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>예상시간:</span>
                      <span style={{ fontWeight: 'bold' }}>{task.estimated_hours}시간</span>
                    </Typography>
                  )}
                  {task.progress > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          진행률: {task.progress}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ flexGrow: 1 }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>새 일감 생성</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="제목"
                value={newTask.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="textSecondary">설명</Typography>
              </Box>
              <Box data-color-mode="light" style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
                <MDEditor
                  value={newTask.description}
                  onChange={(value) => handleChange('description', value || '')}
                  preview="edit"
                  height={200}
                  hideToolbar={false}
                  enableScroll={true}
                />
              </Box>
            </Grid>

            <Grid item container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>유형</InputLabel>
                  <Select
                    value={newTask.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    label="유형"
                  >
                    {Object.entries(taskTypeOptions).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>우선순위</InputLabel>
                  <Select
                    value={newTask.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    label="우선순위"
                  >
                    {Object.entries(priorityOptions).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="예상시간"
                  type="number"
                  value={newTask.estimated_hours || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                    handleChange('estimated_hours', value);
                  }}
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">시간</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <Grid item container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>상위일감</InputLabel>
                  <Select
                    value={newTask.parent_id || ''}
                    onChange={(e) => handleChange('parent_id', e.target.value)}
                    label="상위일감"
                  >
                    <MenuItem value="">
                      <em>없음</em>
                    </MenuItem>
                    {tasks.map((task) => (
                      <MenuItem key={task.id} value={task.id}>
                        #{task.id} {task.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>담당자</InputLabel>
                  <Select
                    value={newTask.assignee_id || ''}
                    onChange={(e) => handleChange('assignee_id', e.target.value)}
                    label="담당자"
                  >
                    <MenuItem value="">
                      <em>없음</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="시작 날짜"
                  value={newTask.start_time ? fromUTCMillis(newTask.start_time) : null}
                  onChange={(date) => handleChange('start_time', date)}
                  slotProps={{
                    textField: { 
                      fullWidth: true,
                      size: 'small'
                    },
                    actionBar: {
                      actions: ['today', 'accept', 'cancel']
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DatePicker
                  label="마감 날짜"
                  value={newTask.due_date ? fromUTCMillis(newTask.due_date) : null}
                  onChange={(date) => handleChange('due_date', date)}
                  slotProps={{
                    textField: { 
                      fullWidth: true,
                      size: 'small'
                    },
                    actionBar: {
                      actions: ['today', 'accept', 'cancel']
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>취소</Button>
          <Button
            onClick={handleCreateTask}
            variant="contained"
          >
            생성
          </Button>
        </DialogActions>
      </Dialog>

      <TaskEditDialog
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onSave={handleTaskSave}
        users={users}
        tasks={tasks}
      />
    </Container>
  );
};

export default TaskListPage;
