import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Switch, Divider, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Alert } from '@mui/material';
import { Navbar, FavoritesBottomSheet } from '@shared/components';
import { Notifications, Language, Navigation, DeleteForever, Warning, Description, ChevronRight, Security } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@store/store';
import { deleteAccount } from '@features/auth/authSlice';

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  
  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Handle carpark selection from favorites - navigate to home
  const handleFavoriteSelect = (carpark: any) => {
    navigate('/', { state: { selectedCarpark: carpark } });
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setDeleteError('Please enter your password');
      return;
    }

    try {
      setDeleteError('');
      await dispatch(deleteAccount(password)).unwrap();
      // Redirect to login after successful deletion
      navigate('/login', { replace: true });
    } catch (err: any) {
      setDeleteError(err || 'Failed to delete account');
    }
  };

  const openDeleteDialog = () => {
    setPassword('');
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPassword('');
    setDeleteError('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingBottom: '200px', // Space for favorites bottom sheet
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 3,
        px: 2
      }}>
        <Box sx={{ maxWidth: 600, width: '100%' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Settings
          </Typography>

          <Paper elevation={2} sx={{ mb: 2 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Receive alerts about nearby carparks"
                />
                <Switch
                  edge="end"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Navigation />
                </ListItemIcon>
                <ListItemText 
                  primary="Location Services" 
                  secondary="Allow app to access your location"
                />
                <Switch
                  edge="end"
                  checked={locationServices}
                  onChange={(e) => setLocationServices(e.target.checked)}
                />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemIcon>
                  <Language />
                </ListItemIcon>
                <ListItemText 
                  primary="Language" 
                  secondary="English"
                />
              </ListItem>
            </List>
          </Paper>

          {/* Danger Zone */}
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 2,
              border: '2px solid',
              borderColor: 'error.main',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning color="error" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="error" fontWeight="bold">
                Danger Zone
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Once you delete your account, there is no going back. All your data including favorites and history will be permanently deleted.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForever />}
              onClick={openDeleteDialog}
              fullWidth
            >
              Delete Account
            </Button>
          </Paper>

          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ParkMate v1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              © 2025 ParkMate. All rights reserved.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <List disablePadding>
              <ListItem 
                button 
                onClick={() => navigate('/terms-of-service')}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Terms of Service" 
                  secondary="View our terms and conditions"
                />
                <ChevronRight color="action" />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => navigate('/privacy-policy')}
                sx={{ 
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Privacy Policy" 
                  secondary="How we handle your data"
                />
                <ChevronRight color="action" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Warning color="error" sx={{ mr: 1 }} />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted including:
          </DialogContentText>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Your profile and account information
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All saved favorite carparks
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Your parking history
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All preferences and settings
            </Typography>
          </Box>
          <DialogContentText sx={{ mb: 2, fontWeight: 'bold' }}>
            Please enter your password to confirm:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            variant="contained" 
            color="error"
            disabled={isLoading || !password}
          >
            {isLoading ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Favorites Bottom Sheet */}
      <FavoritesBottomSheet 
        onSelectCarpark={handleFavoriteSelect}
        onSelectEvCharger={() => {}} // No-op for settings page since there's no map
      />
    </Box>
  );
};

export default SettingsPage;
