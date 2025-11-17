import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Button,
  Alert,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Clear as ClearIcon,
  History as HistoryIcon,
  LocationOn as LocationIcon,
  DeleteSweep as DeleteSweepIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchHistory } from '../features/history/useSearchHistory';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { history, removeFromHistory, clearAllHistory, formatRelativeTime } = useSearchHistory();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    clearAllHistory();
    setShowClearConfirm(false);
  };

  const handleHistoryItemClick = async (item: any) => {
    try {
      // Navigate to home and pass the carpark data
      navigate('/', { 
        state: { 
          selectedCarparkId: item.carparkId,
          address: item.address 
        } 
      });
    } catch (error) {
      console.error('Error navigating to carpark:', error);
    }
  };

  const groupHistoryByDate = () => {
    const now = Date.now();
    const today: any[] = [];
    const yesterday: any[] = [];
    const lastWeek: any[] = [];
    const older: any[] = [];

    history.forEach(item => {
      const diff = now - item.timestamp;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        today.push(item);
      } else if (days === 1) {
        yesterday.push(item);
      } else if (days <= 7) {
        lastWeek.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, lastWeek, older };
  };

  const renderHistoryGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <Box key={title} sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            px: 2, 
            py: 1, 
            color: '#666',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
        <List sx={{ p: 0 }}>
          {items.map((item, index) => (
            <Box key={item.id}>
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.id);
                    }}
                    sx={{ color: '#999' }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => handleHistoryItemClick(item)}
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                    <LocationIcon sx={{ color: '#2f2ee9', mt: 0.5 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ListItemText
                        primary={item.address}
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ color: '#999', display: 'block' }}
                            >
                              {formatRelativeTime(item.timestamp)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ color: '#666', display: 'block', mt: 0.5 }}
                            >
                              ID: {item.externalId}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
              {index < items.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
    );
  };

  const { today, yesterday, lastWeek, older } = groupHistoryByDate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', pb: 4 }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderBottom: '1px solid #e0e0e0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'white'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate('/')}
              sx={{ color: '#333' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
                Search History
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                {history.length} {history.length === 1 ? 'search' : 'searches'}
              </Typography>
            </Box>
            {history.length > 0 && (
              <Button
                startIcon={<DeleteSweepIcon />}
                onClick={() => setShowClearConfirm(true)}
                color="error"
                variant="outlined"
                size="small"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Content */}
      <Container maxWidth="md" sx={{ mt: 3 }}>
        {/* Clear confirmation alert */}
        {showClearConfirm && (
          <Alert
            severity="warning"
            action={
              <Stack direction="row" spacing={1}>
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color="error" 
                  size="small" 
                  variant="contained"
                  onClick={handleClearAll}
                >
                  Clear
                </Button>
              </Stack>
            }
            sx={{ mb: 2 }}
          >
            Are you sure you want to clear all search history? This cannot be undone.
          </Alert>
        )}

        {/* History content */}
        {history.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 6, 
              textAlign: 'center',
              backgroundColor: 'white',
              borderRadius: 2
            }}
          >
            <HistoryIcon sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
              No Search History
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
              Your searched carparks will appear here
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ borderRadius: 2 }}
            >
              Start Searching
            </Button>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ backgroundColor: 'white', borderRadius: 2, overflow: 'hidden' }}>
            {renderHistoryGroup('Today', today)}
            {renderHistoryGroup('Yesterday', yesterday)}
            {renderHistoryGroup('Last Week', lastWeek)}
            {renderHistoryGroup('Older', older)}
          </Paper>
        )}

        {/* Info section */}
        {history.length > 0 && (
          <Box sx={{ mt: 3, px: 2 }}>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>
              ℹ️ Search history is stored locally on your device
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip 
                label={`Last 20 searches`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label="Tap to navigate" 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label="Swipe to delete" 
                size="small" 
                variant="outlined"
              />
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HistoryPage;
