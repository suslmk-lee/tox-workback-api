import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskListPage from './pages/TaskListPage';
import UserListPage from './pages/UserListPage';
import ProfilePage from './pages/ProfilePage';
import GanttChart from './pages/GanttChart/GanttChart';
import DashboardPage from './pages/DashboardPage';

// Components
import NavBar from './components/NavBar';

// Services
import { isAuthenticated, validateToken } from './services/authService';

// Styles
import './App.css';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isAuth, setIsAuth] = React.useState<boolean>(isAuthenticated());

  React.useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (!isAuthenticated()) {
        if (mounted) setIsAuth(false);
        return;
      }

      try {
        await validateToken();
        if (mounted) setIsAuth(true);
      } catch (error) {
        if (mounted) setIsAuth(false);
      }
    };
    
    checkAuth();

    return () => {
      mounted = false;
    };
  }, []); // 의존성 배열 비움

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {isAuth && <NavBar />}
          <Routes>
            <Route path="/login" element={
              isAuth ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              isAuth ? <Navigate to="/dashboard" replace /> : <RegisterPage />
            } />
            <Route path="/dashboard" element={
              isAuth ? <DashboardPage /> : <Navigate to="/login" replace />
            } />
            <Route path="/tasks" element={
              isAuth ? <TaskListPage /> : <Navigate to="/login" replace />
            } />
            <Route path="/users" element={
              isAuth ? <UserListPage /> : <Navigate to="/login" replace />
            } />
            <Route path="/profile" element={
              isAuth ? <ProfilePage /> : <Navigate to="/login" replace />
            } />
            <Route path="/gantt" element={
              isAuth ? <GanttChart /> : <Navigate to="/login" replace />
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
