import React, { useState } from 'react';
import { Box, TextField, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import AuthLayout from '../../components/auth/AuthLayout';
import GradientButton from '../../components/common/GradientButton';
import './Auth.css';

const ForgotPassword = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sending reset link to:', email);
    setIsSubmitted(true);
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle={
        isSubmitted
          ? "We've sent a password reset link to your email."
          : "No worries, we'll send you reset instructions."
      }
    >
      {!isSubmitted ? (
        <Box component="form" onSubmit={handleSubmit} className="auth-form" noValidate>
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
            className="auth-input"
            sx={{ mb: 3 }}
          />

          <GradientButton
            type="submit"
            fullWidth
            height={48}
            sx={{
              borderRadius: "12px",
              fontSize: "0.98rem",
              fontWeight: 700,
              mb: 3,
            }}
          >
            Reset Password
          </GradientButton>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <GradientButton
            fullWidth
            height={48}
            onClick={() => setIsSubmitted(false)}
            sx={{
              borderRadius: "12px",
              fontSize: "0.98rem",
              fontWeight: 700,
            }}
          >
            Try another email
          </GradientButton>
        </Box>
      )}

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
          Back to login
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
