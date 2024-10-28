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
        const response = await fetch(
          'https://dx-qast.getrightdata.com/dweb/connections/jdbc/all',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSQkZRb3QzQndkeW03dFJfWlk4U3RtR1RYUHRrV3N6Sk05Y1djamJOV3AwIn0.eyJleHAiOjE3MzAyMTQwMjMsImlhdCI6MTczMDEyNzYyMywiYXV0aF90aW1lIjoxNzMwMTI3NjIxLCJqdGkiOiIyMjE5MTE5Zi0wMDE2LTRjMTUtYmUxMC0wNzc4MDJmNDI2MjQiLCJpc3MiOiJodHRwczovL2R4LXFhc3QuZ2V0cmlnaHRkYXRhLmNvbTo5NDQzL3JlYWxtcy9kZXh0cnVzIiwiYXVkIjoiZGF0YS1tYXJrZXQiLCJzdWIiOiI1NDUwMDg3Ny1jMDc5LTQwYjctOWRhNC1mNGM0ODFjNDk4MmQiLCJ0eXAiOiJJRCIsImF6cCI6ImRhdGEtbWFya2V0Iiwibm9uY2UiOiI4ZDY0N2FiMi1mYjQyLTQ5ZmYtYjhlMy0wMjIxZWJmNTdkOGEiLCJzZXNzaW9uX3N0YXRlIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiYXRfaGFzaCI6IkVsQ2sxSWlzUlRkSi02cFZ5cUt1Z3ciLCJhY3IiOiIxIiwic2lkIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiaXNEZlVzZXIiOnRydWUsImlzQ29uc3VtZXIiOnRydWUsInN1YiI6IkRYQURNSU46MSIsImNsaWVudElkIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3NSb2xlcyI6WyJncy5keGFkbWluLXJvbGUiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJvbmx5RGF0YU1hcmtldEFsbG93ZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImdpdmVuX25hbWUiOiJEYXZpZCIsInVzZXJOYW1lIjoiRGF2aWQiLCJ1c2VySWQiOiIxIiwidXVpZCI6IjU0NTAwODc3LWMwNzktNDBiNy05ZGE0LWY0YzQ4MWM0OTgyZCIsIm5hbWUiOiJEYXZpZCBhZG1pbiIsInVzZXJFbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImJ1c2luZXNzT3duZXIiOnRydWUsImZhbWlseV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSJ9.TopTeVYJZUwbi-uMwL6JPAp-hwivY6rKmTzOA5DObdWmihQZwhgshQQU_-Qv-788G5TXpMJ0WCBku3UUq85Lszsuo-9YufQEH44FYZaIsRga-wZHHLseixRL-mOkM14q-RrWW7rKvk3Y5oxHUskLvczRRvG411W7cOhLFTJfUS3xjjm42wgWz2kaGVU70HJNw0NKEbrZwdzmQFnuWQJdz02de5q6UAT4ZxNyXklc9Zvz1hQ87UWozpwkwc3FrFirSA_SgPGDHqHTnXksyPgbsht-oLioL9oG7lxOsP8PRCk0jUwiRH0XEhWTlvyZfSPg58POfE7jB9fFIGlPMSj4pg`
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