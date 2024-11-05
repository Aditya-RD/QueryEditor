// QueryGenerator.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stepper from './Stepper';
import StepSources from './StepSources';
import StepQuery from './StepQuery';
import StepDetails from './StepDetails';
import { Box, Button } from '@mui/material';
import { listOfProfiles } from './services/listOfProfiles';
import { getWorksheetsByWorkookId } from './services/worksheets';
//import './QueryGenerator.css';

const QueryGenerator = ({ optionType }) => {
  const { id } = useParams();
  const steps = ['Sources', 'Query', 'Details'];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedSource, setSelectedSource] = useState(null);
  const [queryData, setQueryData] = useState('');
  const [queryDetails, setQueryDetails] = useState({ name: '', description: '' });
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [nextTabId, setNextTabId] = useState(1);
  const [tabs, setTabs] = useState([
    {
      id: 0,
      title: 'Worksheet 1',
      content: '',
      promptOpen: optionType === 'gen-ai',
      gridData: null,
      resultsLoading: false,
      innerTabIndex: 0,
      splitterOptions: {
        percentage1: 50,
        percentage2: 50,
        minSize1: 100,
        minSize2: 100,
        gutterSize: 2,
        direction: 'vertical',
        collapseButtonVisible: true,
        initiallyCollapsed: true,
      },
    },
  ]);

  // New state for sources and related data
  const [sources, setSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchSources = async () => {
    try {
      const data = await listOfProfiles();
      const rdbmsSources = data.filter(
        (source) => source.dataSourceCategory === 'RDBMS'
      );
      setSources(rdbmsSources);
    } catch (error) {
      console.error('Error fetching sources:', error);
      setError('Failed to load sources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorksheets = async () => {
    try {
      const data = await getWorksheetsByWorkookId(id);
      // Handle the data from the API
      console.log(data);
    } catch (error) {
      console.error("Error fetching worksheets:", error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (sources.length === 0) {
        await fetchSources();
      }
      if (id) {
        await fetchWorksheets();
      }
    };
    fetchData();
  }, [id]);

  const handleNext = () => {
    // Validation before proceeding
    if (steps[currentStepIndex] === 'Sources' && !selectedSource) {
      alert('Please select a source to continue.');
      return;
    }
    if (steps[currentStepIndex] === 'Query' && !queryData) {
      alert('Please enter a query to continue.');
      return;
    }
    if (steps[currentStepIndex] === 'Details' && !queryDetails.name) {
      alert('Please enter a name for the query.');
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Final step completed
      setIsCompleted(true);
      // Optionally, navigate to a summary page or back to home
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleCompleteLastStep = () => {
    setIsCompleted(true);
    navigate('/');
  };

  const renderStepContent = () => {
    switch (steps[currentStepIndex]) {
      case 'Sources':
        return (
          <StepSources
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            sources={sources}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        );
      case 'Query':
        return (
          <StepQuery
            selectedSource={selectedSource}
            queryData={queryData}
            setQueryData={setQueryData}
            optionType={optionType}
            tabs={tabs}
            setTabs={setTabs}
            activeTabIndex={activeTabIndex}
            setActiveTabIndex={setActiveTabIndex}
            nextTabId={nextTabId}
            setNextTabId={setNextTabId}
          />
        );
      case 'Details':
        return (
          <StepDetails
            queryDetails={queryDetails}
            setQueryDetails={setQueryDetails}
            onComplete={handleCompleteLastStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stepper steps={steps} currentStep={currentStepIndex} isCompleted={isCompleted} />
      <div
        className="step-content"
        style={{
          height: 'calc(100% - 115px)',
          borderBottom: '1px solid #ccc',
          display: 'flex',
        }}
      >
        {renderStepContent()}
      </div>
      <Box
        display="flex"
        justifyContent="flex-end"
        padding="20px"
        alignItems="center"
        height={56}
      >
        {currentStepIndex > 0 && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePrevious}
            sx={{ mr: 2 }}
          >
            Previous
          </Button>
        )}
        <Button variant="contained" color="primary" onClick={handleNext}>
          {currentStepIndex < steps.length - 1 ? 'Next' : 'Finish'}
        </Button>
      </Box>
    </>
  );
};

export default QueryGenerator;
