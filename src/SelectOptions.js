import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectOption = () => {
  const navigate = useNavigate();

  const handleOptionSelect = (option) => {
    if (option === 1) {
      navigate('/custom-query/sources'); // Navigate to the first step of the custom query
    } else if (option === 2) {
      navigate('/gen-ai/sources'); // Navigate to the first step of the Gen AI option
    }
  };

  return (
    <div className="container">
      <h2>Select an Option</h2>
      <button className="btn btn-primary m-2" onClick={() => handleOptionSelect(1)}>
        Create Custom Query
      </button>
      <button className="btn btn-secondary m-2" onClick={() => handleOptionSelect(2)}>
        Create Query using Gen AI
      </button>
    </div>
  );
};

export default SelectOption;
