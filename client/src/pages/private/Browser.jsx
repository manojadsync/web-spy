import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Browser = () => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Browser Controls</Typography>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Typography variant="body1" color="text.secondary">
          Browser and session management will be displayed here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Browser;
