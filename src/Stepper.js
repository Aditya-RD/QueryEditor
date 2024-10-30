import React from 'react';
import Button from '@mui/material/Button'; // Import MUI Button
import CheckIcon from '@mui/icons-material/Check'; // Import MUI Check Icon
import './Stepper.css';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="stepper-wrapper">
      <span className="stepper-title">Create Query</span>
      <div className="stepper-container">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`stepper-item ${index < currentStep ? 'completed' : ''} ${
                index === currentStep ? 'active' : ''
              }`}
            >
              <div className="step-number">
                {index < currentStep ? <CheckIcon fontSize="small" /> : index + 1}
              </div>
              <div className="step-name">{step}</div>
            </div>
            {index < steps.length - 1 && <span className="step-separator">›</span>}
          </React.Fragment>
        ))}
      </div>
      <Button variant="outlined" color="secondary" className="cancel-button">
        Cancel
      </Button>
    </div>
  );
};

export default Stepper;
