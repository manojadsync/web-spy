import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import GradientButton from '../common/GradientButton';

const LoginForm = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e) => e.preventDefault();

  return (
    <Box component="form" onSubmit={handleLogin} className="auth-form" noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        id="email"
        label="Email"
        variant="outlined"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
        disabled={isLoading}
        className="auth-input"
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        id="password"
        label="Password"
        variant="outlined"
        margin="normal"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        className="auth-input"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  disabled={isLoading}
                  sx={{
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                    '&:hover': {
                      color: isDark ? '#ffffff' : '#000000',
                    },
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                disabled={isLoading}
                sx={{
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                  '&:hover': {
                    color: isDark ? '#ffffff' : '#000000',
                  },
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

      <Box
        className="auth-actions"
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 0.5,
          mb: 3,
        }}
      >
        <Link
          to="/forgot-password"
          className="auth-link"
          style={{
            color: isDark ? '#60a5fa' : '#426ee5',
            textDecoration: 'none',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          Forgot password?
        </Link>
      </Box>

      <GradientButton
        type="submit"
        fullWidth
        height={48}
        disabled={isLoading}
        sx={{
          borderRadius: "12px",
          fontSize: "0.98rem",
          fontWeight: 700,
        }}
      >
        {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
      </GradientButton>

      <Divider
        className="auth-divider"
        sx={{
          my: 3,
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
          fontSize: '0.85rem',
        }}
      >
        or
      </Divider>

      <Typography
        variant="body2"
        className="auth-footer-text"
        sx={{
          textAlign: 'center',
          color: theme.palette.text.secondary,
          fontSize: '0.88rem',
        }}
      >
        Don't have an account?{' '}
        <Link
          to="/forgot-password"
          className="auth-link"
          style={{
            color: isDark ? '#60a5fa' : '#426ee5',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Contact Admin
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginForm;
