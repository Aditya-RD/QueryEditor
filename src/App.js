import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, Button, Box } from '@mui/material';
import SelectOption from './SelectOptions';
import Stepper from './Stepper';
import StepSources from './StepSources';
import StepQuery from './StepQuery';
import StepDetails from './StepDetails';
import './App.css';
import Logo from './assets/images/logo.svg';
import Home from './assets/images/HomeIcon.svg';
import QueryStats from './assets/images/flowChart.png';

const drawerWidth = 50;

const App = () => {
  const stepsCustomQuery = ['Sources', 'Query', 'Details'];
  const stepsGenAI = ['Sources', 'Query', 'Details'];

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Header />
        <Sidebar />
        <main className="content">
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const Header = () => (
  <AppBar position="fixed" sx={{ zIndex: 1201, height: '40px' }}>
    <Toolbar sx={{ minHeight: '40px !important' }}>
      <img src={Logo} alt="Logo" style={{ height: '24px', marginRight: '15px' }} />
    </Toolbar>
  </AppBar>
);

const Sidebar = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5',
        color: '#0000008a',
        display: 'flex',
        alignItems: 'center',
      },
    }}
  >
    <List sx={{ width: '100%', marginTop: '40px' }}>
      <ListItem button component={Link} to="/" sx={{ justifyContent: 'center' }}>
        <ListItemIcon sx={{ justifyContent: 'center', color: '#0000008a', minWidth: '50px' }}>
          <img src={Home} alt="Home" style={{ height: '24px' }} />
        </ListItemIcon>
      </ListItem>
      <ListItem button component={Link} to="/custom-query" sx={{ justifyContent: 'center' }}>
        <ListItemIcon sx={{ justifyContent: 'center', color: '#0000008a', minWidth: '50px' }}>
          <img src={QueryStats} alt="QueryStats" style={{ height: '24px' }} />
        </ListItemIcon>
      </ListItem>
    </List>
  </Drawer>
);

const MultiStepForm = ({ steps, optionType }) => {
  const [selectedSource, setSelectedSource] = useState({});
  const navigate = useNavigate();
  const { '*': stepParam } = useParams();
  const currentStepIndex = steps.findIndex(
    (step) => step.toLowerCase() === (stepParam || steps[0]).toLowerCase()
  );

  const renderStepContent = () => {
    switch (steps[currentStepIndex]) {
      case 'Sources':
        return <StepSources selectedSource={selectedSource} setSelectedSource={setSelectedSource} />;
      case 'Query':
        return <StepQuery selectedSource={selectedSource} />;
      case 'Details':
        return <StepDetails />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (steps[currentStepIndex] === 'Sources' && !selectedSource.id) {
      alert("Please select a source to continue.");
      return;
    }

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
    <>
      <Stepper steps={steps} currentStep={currentStepIndex} />
      <div className="step-content" style={{ height: 'calc(100% - 115px)', borderBottom: '1px solid #ccc', display:'flex' }}>
        {renderStepContent()}
      </div>
      <Box display="flex" justifyContent="right" paddingRight={'20px'} alignItems="center" height={56}>
        {currentStepIndex > 0 && (
          <Button variant="outlined" color="primary" onClick={handlePrevious} sx={{ mr: 2 }}>
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

export default App;
