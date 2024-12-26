import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import TaskListPage from './pages/TaskListPage';
import UserListPage from './pages/UserListPage';
import ProfilePage from './pages/ProfilePage';
import NavBar from './components/NavBar';
import { isAuthenticated } from './utils/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  return isAuthenticated() ? (
    <>
      <NavBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {element}
      </Box>
    </>
  ) : (
    <Navigate to="/login" />
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated() ? <Navigate to="/tasks" /> : <LoginPage />
              }
            />
            <Route
              path="/tasks"
              element={<PrivateRoute element={<TaskListPage />} />}
            />
            <Route
              path="/users"
              element={<PrivateRoute element={<UserListPage />} />}
            />
            <Route
              path="/profile"
              element={<PrivateRoute element={<ProfilePage />} />}
            />
            <Route path="/" element={<Navigate to="/tasks" />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
