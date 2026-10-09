import React from 'react';
import { Box, Typography } from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';
import './Auth.css';

const Login = () => {
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
            Welcome back
          </Typography>
          <Typography variant="body1" className="auth-subtitle">
            Please enter your details to sign in.
          </Typography>
        </Box>

        <LoginForm />
      </Box>
    </Box>
  );
};

export default Login;
