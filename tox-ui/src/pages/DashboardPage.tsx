import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Task, TaskType, getTasks, getTypeText } from '../services/taskService';
import { User } from '../services/userService';

interface TaskStats {
  type: TaskType;
  count: number;
  name: string;
}

interface StatusStats {
  status: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('작업 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTasksByType = () => {
    const stats: { [key: string]: TaskStats } = {};
    tasks.forEach(task => {
      if (!stats[task.type]) {
        stats[task.type] = {
          type: task.type,
          count: 0,
          name: getTypeText(task.type)
        };
      }
      stats[task.type].count++;
    });
    return Object.values(stats);
  };

  const getTasksByStatus = () => {
    const stats: { [key: string]: StatusStats } = {};
    tasks.forEach(task => {
      if (!stats[task.status]) {
        stats[task.status] = {
          status: task.status,
          count: 0
        };
      }
      stats[task.status].count++;
    });
    return Object.values(stats);
  };

  const getMyTasks = () => {
    return tasks.filter(task => task.assignee_id === user?.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        {/* 사용자 정보 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {user?.name || '사용자'}님의 대시보드
            </Typography>
          </Paper>
        </Grid>

        {/* 작업 통계 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              작업 유형별 통계
            </Typography>
            {user?.role === 'ADMIN' ? (
              <BarChart
                width={500}
                height={300}
                data={getTasksByType()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="작업 수" />
              </BarChart>
            ) : (
              <PieChart width={500} height={300}>
                <Pie
                  data={getTasksByType()}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getTasksByType().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </Paper>
        </Grid>

        {/* 상태별 통계 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography variant="h6" gutterBottom>
              작업 상태별 통계
            </Typography>
            <PieChart width={500} height={300}>
              <Pie
                data={getTasksByStatus()}
                cx={200}
                cy={150}
                labelLine={false}
                label={({ status, value }) => `${status}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {getTasksByStatus().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </Paper>
        </Grid>

        {/* 내 작업 목록 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              내 작업 목록
            </Typography>
            <List>
              {getMyTasks().map((task) => (
                <ListItem key={task.id}>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {getTypeText(task.type)}
                        </Typography>
                        {` - ${task.description}`}
                      </React.Fragment>
                    }
                  />
                  <Chip label={task.status} color="primary" size="small" />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;
