import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import { useNavigate } from 'react-router-dom';
import magicwand from './magic-wand.png';
import { getWorkbooks, deleteWorkbook } from './services/workbooks';

function SelectOptions() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowData, setRowData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkbooks = async () => {
      let data = await getWorkbooks();
      data = data.map((v) => ({
        ...v,
        CreatedBy: 'Sun',
        ModifiedBy: 'Wealth',
      }));
      setRowData(data);
    };
    fetchWorkbooks();
  }, []);

  const handleAddModelClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleOptionSelect = (option) => {
    navigate(option === 1 ? '/custom-query' : '/gen-ai');
    handleClose();
  };

  const handleDeleteSelected = useCallback(async () => {
    if (selectedRow) {
      await deleteWorkbook(selectedRow.WorkbookID);
      setRowData((prevRowData) =>
        prevRowData.filter((row) => row.WorkbookID !== selectedRow.WorkbookID)
      );
      setSelectedRow(null);
    }
  }, [selectedRow]);

  const filteredData = useMemo(() =>
    rowData.filter((row) =>
      row.Name.toLowerCase().includes(searchTerm) ||
      row.CreatedBy.toLowerCase().includes(searchTerm) ||
      row.ModifiedBy.toLowerCase().includes(searchTerm)
    ),
    [rowData, searchTerm]
  );

  return (
    <Box display="flex" height="100%" bgcolor="#f9fafb">
      <Box flex={1} padding={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0} sx={{ borderBottom: '2px solid #ddd', pb: 1 }}>
          <Typography variant="h6">All Workbooks</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleAddModelClick}
            sx={{ bgcolor: '#007bff' }}
          >
            Add Workbook
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} PaperProps={{ sx: { width: 240, mt: 1, ml: -7, borderRadius: 1 } }}>
            <MenuItem onClick={() => handleOptionSelect(2)}>
              <ListItemIcon><img src={magicwand} alt="Magic Wand" style={{ width: 20, height: 20 }} /></ListItemIcon>
              <ListItemText>Ask AI</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleOptionSelect(1)}>
              <ListItemIcon><CodeIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Custom Query</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Filters and Search */}
        <Box display="flex" gap={2} justifyContent="space-between" mb={0} py={1} sx={{ borderBottom: '2px solid #ddd' }}>
          <Button variant="outlined" onClick={handleDeleteSelected} disabled={!selectedRow}>Delete</Button>
          <Box flex={1} display="flex" alignItems="center" border="1px solid #ccc" borderRadius={1} px={1} maxWidth={400}>
            <SearchIcon color="action" />
            <TextField
              placeholder="Search..."
              variant="standard"
              fullWidth
              InputProps={{ disableUnderline: true }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </Box>
        </Box>

        {/* AG-Grid Table */}
        <Box height="calc(100vh - 190px)" className="ag-theme-alpine" mt={1}>
          <AgGridReact
            rowData={filteredData}
            columnDefs={[
              { field: 'Name', headerName: 'Name', sortable: true, filter: true, width: 400 },
              { field: 'CreatedBy', headerName: 'Created By', sortable: true, filter: true },
              { field: 'Timestamp', headerName: 'Created On', sortable: true, filter: true },
              { field: 'ModifiedBy', headerName: 'Modified By', sortable: true, filter: true },
              { field: 'Timestamp', headerName: 'Modified On', sortable: true, filter: true },
            ]}
            rowSelection={{ type: 'single' }}
            pagination={true}
            onSelectionChanged={(event) => {
              const selectedNodes = event.api.getSelectedNodes();
              setSelectedRow(selectedNodes.length > 0 ? selectedNodes[0].data : null);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default SelectOptions;
