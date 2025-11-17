import { useState, FormEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { Button, Input } from '@shared/components';
import apiClient from '@services/apiClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                If an account exists for <strong>{email}</strong>, you will receive
                a password reset link shortly.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The email should arrive within a few minutes. Please check your spam folder if you don't see it.
              </Typography>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Back to Login
                </Button>
              </RouterLink>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<ArrowBack />}
                variant="text"
                sx={{ mb: 2 }}
              >
                Back to Login
              </Button>
            </RouterLink>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                name="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                loading={isLoading}
                fullWidth
                sx={{ mt: 1 }}
              >
                Send Reset Link
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
                  <RouterLink 
                    to="/login" 
                    style={{ 
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    Sign in
                  </RouterLink>
                </Typography>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
