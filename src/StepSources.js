import React, { useState } from 'react';
import './StepSources.css'; // Custom CSS for additional styling

const sources = [
  { name: 'Snowflake', icon: '❄️' }, // Replace with actual icon components or image URLs
  { name: 'Google Ads', icon: '📈' },
  { name: 'Salesforce', icon: '🔄' },
  { name: 'Hubspot', icon: '📊' },
  { name: 'Spreadsheets', icon: '📋' },
  { name: 'Marketo', icon: '📊' },
];

const StepSources = () => {
  const [selectedSource, setSelectedSource] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="source-selection-container">
      <div className="header">
        <h5>Select source</h5>
      </div>
      <div className="search-bar mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="source-list">
        {filteredSources.map((source, index) => (
          <div key={index} className="form-check source-item">
            <input
              className="form-check-input"
              type="radio"
              name="source"
              id={`source-${index}`}
              value={source.name}
              checked={selectedSource === source.name}
              onChange={() => setSelectedSource(source.name)}
            />
            <label className="form-check-label d-flex align-items-center" htmlFor={`source-${index}`}>
              <span className="source-icon me-2">{source.icon}</span>
              {source.name}
            </label>
          </div>
        ))}
      </div>
      {/* <div className="footer mt-3">
        <button className="btn btn-secondary me-2">Go Back</button>
        <button className="btn btn-primary" disabled={!selectedSource}>
          Continue
        </button>
      </div> */}
    </div>
  );
};

export default StepSources;
