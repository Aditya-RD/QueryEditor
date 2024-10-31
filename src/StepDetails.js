import React from 'react';
import { Box, Typography, TextField, Button,  Paper } from '@mui/material';
 
const StepDetails = ({ onComplete }) => {
  const handleCreate = () => {
    onComplete(); // Mark the last step as completed
  };

  return (
    <Box display="flex" margin="auto" width="80%" marginTop="40px">
      <Box flex={1} padding={3} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ padding: 3, width: '60%', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Query Details
          </Typography>
          <TextField fullWidth label="Name" variant="outlined" margin="normal" />
          <TextField fullWidth label="Description" variant="outlined" margin="normal" multiline rows={4} />
          <Box display="flex" mt={3} justifyContent="right">
            <Button variant="contained" color="primary" onClick={handleCreate}>
              Create
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StepDetails;