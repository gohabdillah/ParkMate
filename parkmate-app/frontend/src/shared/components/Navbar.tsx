import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Switch,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  History,
  EvStation,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '@store/store';
import { logout } from '@features/auth/authSlice';
import { setEvMode } from '@features/carpark/carparkSlice';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { evMode } = useSelector((state: RootState) => state.carpark);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleEvToggle = () => {
    dispatch(setEvMode(!evMode));
  };

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={() => handleNavigation('/profile')}>
        <AccountCircle sx={{ mr: 2 }} />
        <Typography>Profile</Typography>
      </MenuItem>
      <MenuItem onClick={handleEvToggle}>
        <EvStation sx={{ mr: 2, color: evMode ? 'secondary.main' : 'inherit' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <Typography>EV Chargers</Typography>
          <Switch 
            checked={evMode} 
            size="small"
            color="secondary"
          />
        </Box>
      </MenuItem>
      <MenuItem onClick={() => handleNavigation('/history')}>
        <History sx={{ mr: 2 }} />
        <Typography>History</Typography>
      </MenuItem>
      <MenuItem onClick={() => handleNavigation('/settings')}>
        <Settings sx={{ mr: 2 }} />
        <Typography>Settings</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <Logout sx={{ mr: 2 }} />
        <Typography>Logout</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={1}
        sx={{ 
          backgroundColor: 'primary.main',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            onClick={() => navigate('/')}
            sx={{ 
              flexGrow: 1, 
              textAlign: 'left',
              fontWeight: 'semibold',
              fontFamily: '"Jersey 25", cursive',
              fontSize: '1.8rem',
              color: 'secondary.main',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              '&:hover': {
                opacity: 0.7,
              },
            }}
          >
            ParkMate
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: '#000',
                  color: '#fff'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      {profileMenu}
    </>
  );
};

export default Navbar;