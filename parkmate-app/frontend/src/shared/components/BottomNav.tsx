import { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState<string>('/');

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/settings') {
      setValue('/settings');
    } else {
      setValue('/');
    }
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(newValue);
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid',
        borderColor: 'divider',
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 80,
            padding: '6px 12px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            '&.Mui-selected': {
              fontSize: '0.875rem',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Settings"
          value="/settings"
          icon={<Settings />}
          sx={{
            color: 'text.secondary',
            '&.Mui-selected': {
              color: '#000',
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
