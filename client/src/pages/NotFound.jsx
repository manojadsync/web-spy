import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh"
      bgcolor="background.default"
      textAlign="center"
      p={3}
    >
      <Typography variant="h1" fontWeight="900" color="primary" sx={{ fontSize: { xs: '6rem', md: '10rem' }, opacity: 0.1, position: 'absolute', zIndex: 0 }}>
        404
      </Typography>
      <Box zIndex={1} position="relative">
        <Typography variant="h3" fontWeight="bold" gutterBottom color="text.primary">
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4} maxWidth="400px" mx="auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate('/')}
          disableElevation
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          Back to Home
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
