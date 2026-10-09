import React, { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sending reset link to:', email);
    setIsSubmitted(true);
  };

  return (
    <Box className="auth-container">
      <Box className="auth-card">
        <Box className="auth-header">
          <Box className="logo-container">
            <Box className="logo-shape"></Box>
            <Typography variant="h5" component="h1" fontWeight="800" color="primary">
              WebSpy
            </Typography>
          </Box>
          <Typography variant="h4" className="auth-title">
            Forgot Password?
          </Typography>
          <Typography variant="body1" className="auth-subtitle">
            {isSubmitted 
              ? "We've sent a password reset link to your email."
              : "No worries, we'll send you reset instructions."}
          </Typography>
        </Box>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
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
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              className="auth-button"
              disableElevation
              sx={{ mt: 3, mb: 3 }}
            >
              Reset Password
            </Button>
          </form>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            className="auth-button"
            disableElevation
            sx={{ mt: 3, mb: 3 }}
            onClick={() => setIsSubmitted(false)}
          >
            Try another email
          </Button>
        )}

        <Box display="flex" justifyContent="center">
          <Link to="/" className="auth-link back-link">
            <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
            Back to login
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
