import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TOX Workback
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/tasks"
          >
            작업 목록
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/gantt"
          >
            Gantt 차트
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/users"
          >
            사용자 관리
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/profile"
          >
            내 프로필
          </Button>
          <Button
            color="inherit"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
