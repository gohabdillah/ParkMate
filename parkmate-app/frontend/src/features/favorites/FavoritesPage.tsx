import { Box, Typography, Paper, List, ListItem, ListItemText, IconButton, CircularProgress, Alert } from '@mui/material';
import { Navbar, BottomNav } from '@shared/components';
import { Delete, LocationOn } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { favoritesService } from './favoritesService';
import { useNavigate } from 'react-router-dom';

interface FavoriteWithCarpark {
  id: string;
  userId: string;
  carparkId: string;
  createdAt: string;
  carpark: {
    id: string;
    externalId: string;
    address: string;
    latitude: number;
    longitude: number;
    carparkType?: string;
    parkingSystem?: string;
  };
}

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteWithCarpark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await favoritesService.getUserFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (carparkId: string) => {
    try {
      await favoritesService.removeFavorite(carparkId);
      // Remove from local state
      setFavorites(favorites.filter(fav => fav.carparkId !== carparkId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  const handleNavigateToCarpark = (carpark: FavoriteWithCarpark['carpark']) => {
    // Navigate to home page with the carpark selected
    navigate('/', { state: { selectedCarpark: carpark } });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingBottom: '70px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 3,
        px: 2
      }}>
        <Box sx={{ maxWidth: 800, width: '100%' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            My Favorites
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : favorites.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No favorites yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start adding carparks to your favorites by clicking the heart icon on the map!
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={2}>
              <List>
                {favorites.map((favorite, index) => (
                  <ListItem
                    key={favorite.id}
                    divider={index < favorites.length - 1}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleRemoveFavorite(favorite.carparkId)}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete />
                      </IconButton>
                    }
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleNavigateToCarpark(favorite.carpark)}
                  >
                    <IconButton sx={{ mr: 2, color: 'primary.main' }}>
                      <LocationOn />
                    </IconButton>
                    <ListItemText
                      primary={favorite.carpark.address}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.secondary">
                            ID: {favorite.carpark.externalId}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2" color="text.secondary">
                            Type: {favorite.carpark.carparkType}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: '1rem',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </Box>
  );
};

export default FavoritesPage;
