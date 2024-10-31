import React from 'react';
import { Box, Typography, TextField, Button,  Paper } from '@mui/material';
import {Link } from 'react-router-dom';
 
function CreateModel() {
  return (
    <Box display="flex" minHeight="100vh" bgcolor="#f9fafb">
 
      {/* Main Content */}
      <Box flex={1} padding={3} display="flex" flexDirection="column" alignItems="center">
 
        {/* Form */}
        <Paper elevation={3} sx={{ padding: 3, width: '60%', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Query Details
          </Typography>
 
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
          />
 
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
          />
 
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button variant="outlined" color="primary">Go Back</Button>
            <Button variant="contained" color="primary" to="/" component={Link} >Create</Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
 
export default CreateModel;