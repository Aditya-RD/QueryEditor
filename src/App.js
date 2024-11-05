// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon } from '@mui/material';
import SelectOptions from './SelectOptions';
import QueryGenerator from './QueryGenerator';
import './App.css';
import Logo from './assets/images/logo.svg';
import HomeIcon from './assets/images/HomeIcon.svg';
import QueryStatsIcon from './assets/images/flowChart.png';

const drawerWidth = 50;

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Header />
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<SelectOptions />} />
            <Route path="/custom-query/:id?" element={<QueryGenerator optionType="custom-query" />} />
            <Route path="/gen-ai/:id?" element={<QueryGenerator optionType="gen-ai" />} />
            {/* Uncomment if you have a separate Gen AI component */}
            {/* <Route path="/gen-ai/*" element={<GenAIComponent />} /> */}
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
          <img src={HomeIcon} alt="Home" style={{ height: '24px' }} />
        </ListItemIcon>
      </ListItem>
      <ListItem button component={Link} to="/custom-query" sx={{ justifyContent: 'center' }}>
        <ListItemIcon sx={{ justifyContent: 'center', color: '#0000008a', minWidth: '50px' }}>
          <img src={QueryStatsIcon} alt="Query Stats" style={{ height: '24px' }} />
        </ListItemIcon>
      </ListItem>
    </List>
  </Drawer>
);

export default App;
