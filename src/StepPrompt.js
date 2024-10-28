// import React from 'react';
 
// const StepPrompt = () => {
//   return (
//     <div>
//       <h3>Prompt</h3>
//       <p>Write your Prompt Here.</p>
//       {/* Add form elements for Prompt here */}
//     </div>
//   );
// };
 
// export default StepPrompt;
 
import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment, Typography } from '@mui/material';
import { Send } from '@mui/icons-material';
//import SalesforceIcon from '@mui/icons-material/Cloud'; // Replace with actual Salesforce logo if available
 
function AiQueryPopup() {
  const [inputText, setInputText] = useState('');
  const maxCharacters = 2000;
 
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };
 
  const isDisabled = inputText.length === 0 || inputText.length > maxCharacters;
 
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      borderRadius: '12px',
      backgroundColor: '#f5f5f5',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      width: '500px',
      position: 'relative'
    }}>
      <TextField
        placeholder="Ask AI a question or make a request..."
        multiline
        rows={4}
        value={inputText}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" style={{ marginTop: '-66px'}}>
              <Typography variant="body2">✏️</Typography>
            </InputAdornment>
          ),
          style: { fontSize: '16px', background: '#fff' },
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <Typography variant="body2" style={{ marginRight: '8px' }}>
          {inputText.length}/{maxCharacters}
        </Typography>
        <IconButton
          color="primary"
          style={{
            backgroundColor: isDisabled ? '#d3d3d3' : '#2196F3', // Gray when disabled, blue when enabled
            borderRadius: '50%',
            padding: '10px',
            color: isDisabled ? 'white' : 'white', // Keep icon color white when disabled
            transform: 'rotateZ(320deg)',
          }}
          disabled={isDisabled}
        >
          <Send style={{ color: isDisabled ? 'white' : 'white' }} /> {/* Icon is always white */}
        </IconButton>
      </div>
    </div>
  );
}
 
export default AiQueryPopup;