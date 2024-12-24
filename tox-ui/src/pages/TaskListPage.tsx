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
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import { Task, getTasks } from '../services/taskService';
import { logout } from '../services/authService';

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'TODO':
      return 'default';
    case 'IN_PROGRESS':
      return 'primary';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusText = (status: Task['status']) => {
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

const TaskListPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadTasks();
  }, [navigate]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddTask = () => {
    // TODO: Implement task creation
    console.log('Add task clicked');
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            작업 목록
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {user && (
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            )}
            <IconButton onClick={handleLogout} color="inherit" title="로그아웃">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          sx={{ mb: 3 }}
        >
          새 작업 추가
        </Button>

        <List>
          {tasks.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="등록된 작업이 없습니다."
                secondary="새 작업을 추가해보세요."
              />
            </ListItem>
          ) : (
            tasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  mb: 1,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={task.title}
                  secondary={task.description}
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={getStatusText(task.status)}
                  color={getStatusColor(task.status)}
                  size="small"
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default TaskListPage;
