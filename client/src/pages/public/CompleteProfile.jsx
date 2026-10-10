import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import AuthLayout from '../../components/auth/AuthLayout';
import GradientButton from '../../components/common/GradientButton';
import { userApi } from '../../api/endpoints/userApi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const CompleteProfile = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { saveData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [fetchError, setFetchError] = useState('');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setFetchError('Invitation token is missing');
        setLoading(false);
        return;
      }

      try {
        const res = await userApi.getInviteDetails(token);
        if (res.success && res.data) {
          setInviteData(res.data);
        } else {
          setFetchError(res.message || 'Invalid invitation link');
        }
      } catch (err) {
        setFetchError(
          err.response?.data?.message || 'This invitation link is invalid or has expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await userApi.completeProfile({
        token,
        phone,
        password,
      });

      if (res.success && res.data) {
        // Automatically save login token & user info
        saveData(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        setFormError(res.message || 'Failed to complete profile');
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Error completing your profile. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Complete Profile"
      subtitle="Set up your phone number and password to activate your account."
      maxWidth={520}
    >
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
          <CircularProgress size={36} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Verifying your invitation...
          </Typography>
        </Box>
      ) : fetchError ? (
        <Box>
          <Alert
            severity="error"
            icon={<ErrorOutlineRoundedIcon fontSize="inherit" />}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {fetchError}
          </Alert>
          <GradientButton
            component={Link}
            to="/"
            fullWidth
            height={48}
            sx={{
              borderRadius: "12px",
              fontSize: "0.98rem",
              fontWeight: 700,
            }}
          >
            Back to Sign In
          </GradientButton>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} className="auth-form" noValidate>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
              {formError}
            </Alert>
          )}

          {/* Autofilled Name */}
          <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            margin="normal"
            value={inviteData?.name || ''}
            disabled
            className="auth-input"
            helperText="Prefilled from your invitation"
            sx={{ mb: 1.5 }}
          />

          {/* Autofilled Email */}
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            value={inviteData?.email || ''}
            disabled
            className="auth-input"
            helperText="Prefilled from your invitation"
            sx={{ mb: 1.5 }}
          />

          {/* Phone Number Input */}
          <TextField
            fullWidth
            id="phone"
            label="Phone Number"
            placeholder="+91 98765 43210"
            variant="outlined"
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="auth-input"
            disabled={submitting}
            sx={{ mb: 1.5 }}
          />

          {/* Password Input */}
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
            disabled={submitting}
            className="auth-input"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      disabled={submitting}
                      sx={{
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                        '&:hover': {
                          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
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
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    disabled={submitting}
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                      '&:hover': {
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Must be at least 6 characters"
            sx={{ mb: 1.5 }}
          />

          {/* Confirm Password Input */}
          <TextField
            fullWidth
            id="confirmPassword"
            label="Confirm Password"
            variant="outlined"
            margin="normal"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={submitting}
            className="auth-input"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      disabled={submitting}
                      sx={{
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                        '&:hover': {
                          color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                        },
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                    disabled={submitting}
                    sx={{
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                      '&:hover': {
                        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                      },
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <GradientButton
            type="submit"
            fullWidth
            height={48}
            disabled={submitting}
            sx={{
              borderRadius: "12px",
              fontSize: "0.98rem",
              fontWeight: 700,
              mt: 1.5,
              mb: 2.5,
            }}
          >
            {submitting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'Set Password & Complete Setup'
            )}
          </GradientButton>

          <Box display="flex" justifyContent="center">
            <Link
              to="/"
              className="auth-link back-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.palette.text.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.palette.text.secondary)}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              Back to Sign In
            </Link>
          </Box>
        </Box>
      )}
    </AuthLayout>
  );
};

export default CompleteProfile;
