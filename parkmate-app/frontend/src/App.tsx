import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { AppDispatch, RootState } from '@store/store';
import { initializeAuth } from '@features/auth/authSlice';
import { parkingTheme, evTheme } from './theme';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import Home from './pages/Home';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ProtectedRoute from './shared/components/ProtectedRoute';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <ProtectedRoute>
            <TermsOfServicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <ProtectedRoute>
            <PrivacyPolicyPage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const evMode = useSelector((state: RootState) => state.carpark.evMode);
  
  // Select theme based on evMode
  const theme = useMemo(() => {
    return evMode ? evTheme : parkingTheme;
  }, [evMode]);

  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
