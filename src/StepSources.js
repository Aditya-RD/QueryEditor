import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StepSources.css';

// Import images directly
import MSSQLIcon from './assets/images/MSSQL.png';
import ORACLEIcon from './assets/images/ORACLE.png';
import SNOWFLAKEIcon from './assets/images/SNOWFLAKE.svg';
import POSTGRESIcon from './assets/images/POSTGRES.png';
import SALESFORCEIcon from './assets/images/SALESFORCE.svg';
import MYSQLIcon from './assets/images/MYSQL.png';
import HIVEIcon from './assets/images/HIVE.png';
import HANAIcon from './assets/images/HANA.png';
import DATABRICKSIcon from './assets/images/DATABRICKS.png';

// Map dataSourceId to imported images
const imageMap = {
  1: MSSQLIcon,
  5: ORACLEIcon,
  3: SNOWFLAKEIcon,
  11: POSTGRESIcon,
  9: SALESFORCEIcon,
  6: MYSQLIcon,
  38: HIVEIcon,
  7: HANAIcon,
  34: DATABRICKSIcon // or use DELTALAKEIcon if needed for another category
};

const StepSources = ({ selectedSource, setSelectedSource, onNext }) => {
  const [sources, setSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const bearerToken = process.env.REACT_APP_BEARER_TOKEN;
        const response = await fetch(
          'https://dx-qast.getrightdata.com/dweb/connections/jdbc/all',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${bearerToken}`
            }
          }
        );
        const data = await response.json();
        const rdbmsSources = data.filter(source => source.dataSourceCategory === "RDBMS");
        setSources(rdbmsSources);
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      }
    };
    fetchSources();
  }, []);

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
        {filteredSources.map((source) => (
          <div key={source.id} className="form-check source-item">
            <input
              className="form-check-input"
              type="radio"
              name="source"
              id={`source-${source.id}`}
              value={source.id}
              checked={selectedSource.id === source.id}
              onChange={() => setSelectedSource(source)}
            />
            <label className="form-check-label d-flex align-items-center" htmlFor={`source-${source.id}`}>
              <img
                height={16}
                src={imageMap[source.dataSourceId] || 'assets/images/default.png'}
                alt={`${source.name} icon`}
                className="source-icon me-2"
              />
              {source.name}
            </label>
          </div>
        ))}
      </div>
      <div className="footer mt-3">
        <button className="btn btn-secondary me-2" onClick={() => navigate('/')}>Go Back</button>
        <button className="btn btn-primary" onClick={onNext} disabled={!selectedSource.id}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepSources;