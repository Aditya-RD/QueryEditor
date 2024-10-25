import React from 'react';
import './Stepper.css'; // Import custom CSS for styling

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`stepper-item ${index <= currentStep ? 'active' : ''}`}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-name">{step}</div>
          {index < steps.length - 1 && <div className="stepper-line"></div>}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
