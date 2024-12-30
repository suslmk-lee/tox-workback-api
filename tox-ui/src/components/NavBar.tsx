import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import TimelineIcon from '@mui/icons-material/Timeline';
import LogoutIcon from '@mui/icons-material/Logout';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          TOX
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
          >
            대시보드
          </Button>
          <Button
            color="inherit"
            startIcon={<ListAltIcon />}
            onClick={() => navigate('/tasks')}
          >
            작업
          </Button>
          {user?.role === 'ADMIN' && (
            <Button
              color="inherit"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/users')}
            >
              사용자
            </Button>
          )}
          <Button
            color="inherit"
            startIcon={<TimelineIcon />}
            onClick={() => navigate('/gantt')}
          >
            간트차트
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/profile')}
          >
            프로필
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
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
