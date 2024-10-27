import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import SelectOption from './SelectOptions';
import Stepper from './Stepper';
import StepSources from './StepSources';
import StepQuery from './StepQuery';
import StepDetails from './StepDetails';
import StepPrompt from './StepPrompt';

const App = () => {
  const stepsCustomQuery = ['Sources', 'Query', 'Details'];
  const stepsGenAI = ['Sources', 'Prompt', 'Query', 'Details'];

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<SelectOption />} />
          <Route
            path="/custom-query/*"
            element={<MultiStepForm steps={stepsCustomQuery} optionType="custom-query" />}
          />
          <Route
            path="/gen-ai/*"
            element={<MultiStepForm steps={stepsGenAI} optionType="gen-ai" />}
          />
          <Route path="*" element={<Navigate to="/" />} /> {/* Redirect to home if path doesn't match */}
        </Routes>
      </div>
    </Router>
  );
};

const MultiStepForm = ({ steps, optionType }) => {
  const navigate = useNavigate();
  const { '*': stepParam } = useParams(); // Get the current step from the URL
  const currentStepIndex = steps.findIndex(step => step.toLowerCase() === (stepParam || steps[0]).toLowerCase());

  const renderStepContent = () => {
    switch (steps[currentStepIndex]) {
      case 'Sources': return <StepSources />;
      case 'Prompt': return <StepPrompt />;
      case 'Query': return <StepQuery />;
      case 'Details': return <StepDetails />;
      default: return null;
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1].toLowerCase();
      navigate(`/${optionType}/${nextStep}`);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const previousStep = steps[currentStepIndex - 1].toLowerCase();
      navigate(`/${optionType}/${previousStep}`);
    }
  };

  return (
    <div>
      <Stepper steps={steps} currentStep={currentStepIndex} />
      <div className="step-content" style={{ height: '500px' }}>{renderStepContent()}</div>
      <div className="mt-3">
        {currentStepIndex > 0 && (
          <button className="btn btn-secondary me-2" onClick={handlePrevious}>
            Previous
          </button>
        )}
        {currentStepIndex < steps.length - 1 && (
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
