import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskListPage from './pages/TaskListPage';
import UserListPage from './pages/UserListPage';
import ProfilePage from './pages/ProfilePage';

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

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = React.useState<boolean>(isAuthenticated());

  React.useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        setIsAuth(false);
        return;
      }

      try {
        await validateToken();
      } catch (error) {
        setIsAuth(false);
      }
    };
    
    checkAuth();
  }, []); // 의존성 배열 비움

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Box component="main" sx={{ flexGrow: 1, p: 3 }}>{children}</Box>;
};

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
              isAuth ? <Navigate to="/tasks" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              isAuth ? <Navigate to="/tasks" replace /> : <RegisterPage />
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TaskListPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UserListPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
