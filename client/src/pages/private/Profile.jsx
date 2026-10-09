import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>My Profile</Typography>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="body1" color="text.secondary">
          Manage your personal account settings and preferences here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile;
