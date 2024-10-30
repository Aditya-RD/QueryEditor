import React, { useState } from 'react';
import { Box, Typography, Button, TextField, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
//import SyncIcon from '@mui/icons-material/Sync';
// import CloudIcon from '@mui/icons-material/Cloud';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import HomeIcon from '@mui/icons-material/Home';
// import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import magicwand from './magic-wand.png';
// import Header from './Headerpage';
 
const initialRows  = [
  { id: 1, name: 'SalesforceAndHubspotAccounts', createdBy: 'Nidhi', createdOn: '24-Dec-2023, 7:30 AM', modifiedBy: 'Nidhi', modifiedOn: '28-Jan-2024,  8:34 AM' },
  { id: 2, name: 'Contact List', createdBy: 'Sarada', createdOn: '22-Dec-2023, 7:30 AM', modifiedBy: 'RDAdmin', modifiedOn: '23-Jan-2024,  8:34 AM' },
  { id: 3, name: 'Attribution', createdBy: 'Prasanna', createdOn: '25-Dec-2023, 7:30 AM', modifiedBy: 'Aditya', modifiedOn: '23-Jan-2024,  8:34 AM' },
  { id: 4, name: 'Test Query', createdBy: 'Vinay', createdOn: '24-Dec-2023, 7:30 AM', modifiedBy: 'Ammiraja', modifiedOn: '23-Jan-2024,  8:34 AM' },
  { id: 5, name: 'Null Active Users', createdBy: 'Raju', createdOn: '24-Dec-2023, 7:30 AM', modifiedBy: 'Raju', modifiedOn: '23-Jan-2024,  8:34 AM' },
  { id: 6, name: 'Null (UTM)', createdBy: 'Manish', createdOn: '27-Dec-2023, 7:30 AM', modifiedBy: 'Sharvani', modifiedOn: '23-Jan-2024,  8:34 AM' },
  { id: 7, name: 'Orders', createdBy: 'Narender', createdOn: '27-Dec-2023, 7:30 AM', modifiedBy: 'Ajith', modifiedOn: '23-Jan-2024,  8:34 AM' },
];
 
function App() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [isFiltered, setIsFiltered] = useState(false);
  const navigate = useNavigate();
 
  const handleAddModelClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
 
  const handleClose = () => {
    setAnchorEl(null);
  };
 
  const handleLastUpdateClick = () => {
    // Determine the latest date across all rows for both `createdOn` and `modifiedOn`
    const latestDate = initialRows.reduce((latest, current) => {
      const createdDate = dayjs(current.createdOn, 'DD-MMM-YYYY, h:mm A');
      const modifiedDate = dayjs(current.modifiedOn, 'DD-MMM-YYYY, h:mm A');
 
      // Check which date is the latest between createdOn and modifiedOn for the current row
      const currentLatestDate = createdDate.isAfter(modifiedDate) ? createdDate : modifiedDate;
 
      // Update latestDate if currentLatestDate is more recent
      return currentLatestDate.isAfter(latest) ? currentLatestDate : latest;
    }, dayjs('1900-01-01')); // Initialize with a date far in the past
 
    // Filter rows to include only those with the latest date
    const latestRows = initialRows.filter((row) => {
      const createdDate = dayjs(row.createdOn, 'DD-MMM-YYYY, h:mm A');
      const modifiedDate = dayjs(row.modifiedOn, 'DD-MMM-YYYY, h:mm A');
 
      // Include the row if either `createdOn` or `modifiedOn` matches the latest date
      return createdDate.isSame(latestDate) || modifiedDate.isSame(latestDate);
    });
 
    // Update the state with rows having the latest date
    setFilteredRows(latestRows);
    setIsFiltered(true);
  };
 
 
  const handleClearFilter = () => {
    setFilteredRows(initialRows);
    setIsFiltered(false);
  };
 
  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
 
    const filtered = initialRows.filter((row) => {
      const createdOnDate = dayjs(row.createdOn, 'DD-MMM-YYYY, h:mm A').format('YYYY-MM-DD');
      const modifiedOnDate = dayjs(row.modifiedOn, 'DD-MMM-YYYY, h:mm A').format('YYYY-MM-DD');
 
      return (
        row.name.toLowerCase().includes(searchValue) ||
        row.createdBy.toLowerCase().includes(searchValue) ||
        row.modifiedBy.toLowerCase().includes(searchValue) ||
        createdOnDate.includes(searchValue) ||
        modifiedOnDate.includes(searchValue)
      );
    });
 
    setFilteredRows(filtered);
  };
  const handleOptionSelect = (option) => {
    if (option === 1) {
      navigate('/custom-query/sources'); // Navigate to the first step of the custom query
    } else if (option === 2) {
      navigate('/gen-ai/sources'); // Navigate to the first step of the Gen AI option
    }
  };
 
  return (
    <Box display="flex" height="100vh" bgcolor="#f9fafb" className="p-0">
      {/* Header Section */}
      {/* <Header /> Add the Header component here */}
      {/* Sidebar */}
      {/* <Box display="flex" flex={1} sx={{position: 'absolute', top: '40px', width: '100%'}}>
      <Box width="50px" bgcolor="#f5f5f5" display="flex" flexDirection="column" alignItems="center" paddingY={2} sx={{borderRight: '2px solid #ddd'}}>
        <IconButton><HomeIcon /></IconButton>
        <IconButton><AccountCircleIcon /></IconButton>
        <IconButton><CloudIcon /></IconButton>
        <IconButton><SyncIcon /></IconButton>
        <IconButton><LockIcon /></IconButton>
        <Avatar sx={{ position: 'absolute', bottom: 16 }} src="https://i.pravatar.cc/40" />
      </Box>
       */}
      {/* Main Content */}
      <Box flex={1} padding={2}>
       
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{paddingBottom: '5px', borderBottom: '2px solid #ddd', margin: '0px'}}>
          <Typography variant="h6">All Queries</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleAddModelClick}
            sx={{ bgcolor: '#007bff'}}  // Blue color for the button
          >
            Add Query
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}
              PaperProps={{
                sx: {
                  width: '240px',
                  marginTop: '8px',
                  marginLeft: '-120px',
                  zIndex: 1300,
                  borderRadius: '10px'
                }
              }}
            >
            <MenuItem onClick={handleClose}>
              <ListItemIcon><img src={magicwand} alt="Magic Wand" style={{ width: '20px', height: '20px' }} /></ListItemIcon>
              <ListItemText onClick={() => handleOptionSelect(2)}>Ask AI</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon><CodeIcon fontSize="small" /></ListItemIcon>
              <ListItemText onClick={() => handleOptionSelect(1)}>Custom Query</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
 
        {/* Filters and Search */}
        <Box display="flex" gap={2} mb={2} sx={{paddingBottom: '5px', borderBottom: '2px solid #ddd', justifyContent: 'space-between', margin: '0px', padding: '10px 0px'}}>
            <div style={{display:'flex', gap:'10px'}}>
              <Button variant="outlined"  onClick={handleLastUpdateClick} disabled={isFiltered}>Last update</Button>
              <Button variant="outlined" onClick={handleClearFilter} disabled={!isFiltered}>Clear Filter</Button>
            </div>
            <Box flex={1} display="flex"  alignItems="center" border="1px solid #ccc" borderRadius="4px" paddingX={1} maxWidth={400}>
              <SearchIcon color="action" />
              <TextField placeholder="Search..." variant="standard" fullWidth InputProps={{ disableUnderline: true }} value={searchTerm} onChange={handleSearchChange} />
            </Box>
        </Box>
 
        {/* Data Table */}
        <Box height="calc(100vh - 190px)" bgcolor="white" borderRadius="8px" boxShadow={1} sx={{marginTop: '10px'}}>
          <DataGrid
            rows={filteredRows}
            columns={[
              { field: 'name', headerName: 'Name', width: 300 },
              { field: 'createdBy', headerName: 'Created By', width: 200 },
              { field: 'createdOn', headerName: 'Created On', width: 250 },
              { field: 'modifiedBy', headerName: 'Modified By', width: 200 },
              { field: 'modifiedOn', headerName: 'Modified On', width: 250 },
            ]}
            pageSize={5}
            disableSelectionOnClick
            checkboxSelection
          />
        </Box>
      </Box>
    </Box>
  );
}
 
export default App;