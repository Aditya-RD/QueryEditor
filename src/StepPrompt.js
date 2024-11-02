// StepPrompt.js
import React, { useState } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import magicwand from './magic-wand.png';

function AiQueryPopup({ onInsertText }) {
  const [inputText, setInputText] = useState('');
  const maxCharacters = 2000;

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const isDisabled = inputText.length === 0 || inputText.length > maxCharacters;

  const handleSendClick = () => {
    if (!isDisabled) {
      onInsertText(inputText); // Pass inputText to the StepQuery component
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        borderRadius: '0 0 12px 12px',
        backgroundColor: '#f5f5f5',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '500px',
        position: 'relative',
      }}
    >
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
            <InputAdornment position="start" style={{ marginTop: '-66px' }}>
              <Typography variant="body2">
                <img
                  src={magicwand}
                  alt="Magic Wand"
                  style={{ width: '20px', height: '20px', marginTop: '-5px' }}
                />
              </Typography>
            </InputAdornment>
          ),
          style: { fontSize: '16px', background: '#fff' },
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <Typography variant="body2" style={{ marginRight: '8px' }}>
          {inputText.length}/{maxCharacters}
        </Typography>
        <IconButton
          color="primary"
          onClick={handleSendClick}
          style={{
            backgroundColor: isDisabled ? '#d3d3d3' : '#2196F3',
            borderRadius: '50%',
            padding: '10px',
            color: 'white',
            transform: 'rotateZ(320deg)',
          }}
          disabled={isDisabled}
        >
          <Send />
        </IconButton>
      </div>
    </div>
  );
}

export default AiQueryPopup;
