import React from 'react';

const Stepper = ({ steps, currentStep }) => {
  return (
    <ul className="nav nav-pills">
      {steps.map((step, index) => (
        <li key={index} className="nav-item">
          <button
            className={`nav-link ${index === currentStep ? 'active' : ''}`}
            disabled={index !== currentStep}
          >
            {step}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Stepper;
