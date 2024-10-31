import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button'; 
import CheckIcon from '@mui/icons-material/Check'; // Import MUI Check Icon
import './Stepper.css';
import QueryStats from './assets/images/flowChart.png';

const Stepper = ({ steps, currentStep, isCompleted }) => {
  const navigate = useNavigate();
  return (
    <div className="stepper-wrapper">
      <span className="stepper-title">
        <img src={QueryStats} alt="QueryStats" style={{ height: '24px', marginRight: '10px', marginTop: '-7px' }} />
        Create Query
      </span>
      <div className="stepper-container">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`stepper-item ${index < currentStep || (isCompleted && index === steps.length - 1) ? 'completed' : ''} ${
                index === currentStep ? 'active' : ''
              }`}
            >
              <div className="step-number">
                {index < currentStep || (isCompleted && index === steps.length - 1) ? <CheckIcon fontSize="small" /> : index + 1}
              </div>
              <div className="step-name">{step}</div>
            </div>
            {index < steps.length - 1 && <span className="step-separator">›</span>}
          </React.Fragment>
        ))}
      </div>
      <Button variant="outlined" color="secondary" className="cancel-button" onClick={() => navigate('/')}>
        Cancel
      </Button>
    </div>
  );
};

export default Stepper;
