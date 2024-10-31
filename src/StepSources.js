// StepSources.js

import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import './StepSources.css';
import MSSQLIcon from './assets/images/MSSQL.png';
import ORACLEIcon from './assets/images/ORACLE.png';
import SNOWFLAKEIcon from './assets/images/SNOWFLAKE.svg';
import POSTGRESIcon from './assets/images/POSTGRES.png';
import SALESFORCEIcon from './assets/images/SALESFORCE.svg';
import MYSQLIcon from './assets/images/MYSQL.png';
import HIVEIcon from './assets/images/HIVE.png';
import HANAIcon from './assets/images/HANA.png';
import DATABRICKSIcon from './assets/images/DATABRICKS.png';
import DefaultIcon from './assets/images/MSSQL.png';

const imageMap = {
  1: MSSQLIcon,
  5: ORACLEIcon,
  3: SNOWFLAKEIcon,
  11: POSTGRESIcon,
  9: SALESFORCEIcon,
  6: MYSQLIcon,
  38: HIVEIcon,
  7: HANAIcon,
  34: DATABRICKSIcon
};

const StepSources = ({ selectedSource, setSelectedSource }) => {
  const [sources, setSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const bearerToken = process.env.REACT_APP_BEARER_TOKEN || 'defaultToken';
      const response = await fetch(
        'https://dx-qast.getrightdata.com/dweb/connections/jdbc/all',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${bearerToken}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch sources');

      const data = await response.json();
      const rdbmsSources = data.filter(source => source.dataSourceCategory === 'RDBMS');
      setSources(rdbmsSources);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setError('Failed to load sources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
        />
      </div>

      {loading ? (
        <div className="loader-container">
          <CircularProgress aria-label="Loading sources" />
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
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
                  src={imageMap[source.dataSourceId] || DefaultIcon}
                  alt={`${source.name} icon`}
                  className="source-icon me-2"
                />
                {source.name}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StepSources;
