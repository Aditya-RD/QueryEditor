// StepQuery.js
import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  IconButton,
  Button,
  Modal,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MenuIcon from '@mui/icons-material/Menu';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import DatabaseTree from './DatabaseTree'; import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import FlexiSplit from './FlexiSplit';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';
import AiQueryPopup from './StepPrompt';
import magicwandIcon from './magic-wand.png';
import PlayArrowIcon from './assets/images/run-query.svg';
import FileDownloadIcon from './assets/images/download_color.svg';
import ClearIcon from './assets/images/close.svg';

// Add the executeQuery function here

const splitOptions = {
  percentage1: 70,
  percentage2: 30,
  minSize1: 100,
  minSize2: 100,
  gutterSize: 2,
  direction: 'horizontal',
  collapseButtonVisible: true,
  initiallyCollapsed: true,
};

const splitOptionsi = {
  percentage1: 70,
  percentage2: 30,
  minSize1: 100,
  minSize2: 100,
  gutterSize: 2,
  direction: 'vertical',
  collapseButtonVisible: true,
  initiallyCollapsed: true,
};

const SQLEditor = ({ value, onChange, onDrop, onDragOver }) => {
  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CodeMirror
        value={value}
        extensions={[sql()]}
        options={{
          lineNumbers: true,
          lineWrapping: true,
        }}
        onChange={onChange}
        editorDidMount={(editor) => {
          editor.dom.addEventListener('dragover', onDragOver);
          editor.dom.addEventListener('drop', (event) => onDrop(editor, event));
        }}
        style={{ height: '100%', overflow: 'auto' }}
      />
    </div>
  );
};

// New function to execute the query and fetch results
const executeQuery = async (queryText) => {
  try {
    const bearerToken = process.env.REACT_APP_BEARER_TOKEN;
    const response = await fetch('https://dx-qast.getrightdata.com/dbexplorer/services/run-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`
      },
      body: JSON.stringify({
        sourceType: "RDBMS_QUERY_SERVICE",
        source: {
          type: "MSSQL",
          profileId: null,
          connectionInfo: {
            existingConnection: false,
            connectionJDBCURL: "jdbc:sqlserver://10.10.20.203:1433",
            username: "rd_db_load",
            password: "J93EmKePkG/M9kzQTUxqcg==",
            className: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
            schema: null,
            catalog: null
          },
          sourceInfo: {
            id: "1",
            sourceTableOrQuery: queryText, // Active tab's query text
            blendColumns: null,
            driverTable: false
          },
          datasetJoins: null,
          purpose: "dataPreview",
          skipRows: 0,
          previewCount: 10,
          guid: Math.random() // Random GUID for each request
        }
      })
    });
    const result = await response.json();
    if (result.flag && result.data && result.columns) {
      return {
        columns: JSON.parse(result.columns),
        rows: JSON.parse(result.data)
      };
    } else {
      throw new Error('Failed to retrieve data');
    }
  } catch (error) {
    console.error('Query execution failed:', error);
    return null;
  }
};

// StepQuery component begins here
const StepQuery = ({ selectedSource }) => {
  const [tabs, setTabs] = useState([{ id: 0, title: 'Query 1', content: '' }]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [nextTabId, setNextTabId] = useState(1);
  const [gridData, setGridData] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [mainSplitterConfig, setMainSplitterConfig] = useState({
    percentage1: 70,
    percentage2: 30,
    minSize1: 100,
    minSize2: 100,
    gutterSize: 2,
    direction: 'horizontal',
    collapseButtonVisible: true,
    initiallyCollapsed: true,
  });

  const handleToggleNavigator = () => {
    setMainSplitterConfig(prevState => ({
      ...prevState,
      initiallyCollapsed: !prevState.initiallyCollapsed
    })); // Toggle the collapse state
  };

  const handleInsertText = (text) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, i) =>
        i === activeTabIndex ? { ...tab, content: tab.content + text } : tab
      )
    );
    handleCloseModal();
  };

  const handleAddTab = () => {
    const newTab = { id: nextTabId, title: `Query ${nextTabId + 1}`, content: '' };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabIndex(tabs.length);
    setNextTabId(nextTabId + 1);
  };

  const handleDeleteTab = (tabId) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const updatedTabs = tabs.filter((tab) => tab.id !== tabId);

    if (updatedTabs.length === 0) {
      setActiveTabIndex(0);
    } else if (tabIndex <= activeTabIndex) {
      setActiveTabIndex(Math.max(0, activeTabIndex - 1));
    }

    setTabs(updatedTabs);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(tabs[activeTabIndex].content);
    alert('Query copied to clipboard');
  };

  const handlePrettyPrintQuery = () => {
    const formattedQuery = tabs[activeTabIndex].content.split(/\s+/).join(' ');
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, content: formattedQuery } : tab
      )
    );
  };

  const handleExportQuery = () => {
    const element = document.createElement('a');
    const file = new Blob([tabs[activeTabIndex].content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${tabs[activeTabIndex].title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearEditor = () => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, content: '' } : tab
      )
    );
  };

  const handleRunQuery = async () => {
    const activeQuery = tabs[activeTabIndex].content;
    const data = await executeQuery(activeQuery);
    if (data) {
      setGridData(data);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <FlexiSplit element1Id="panel1" element2Id="panel2" options={mainSplitterConfig}>
        <div style={{ height: '100%', overflowY: 'hidden' }}>
          <FlexiSplit element1Id="paneli1" element2Id="paneli2" options={splitOptionsi}>
            <div style={{ height: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                <Tabs value={activeTabIndex} onChange={(e, newTab) => setActiveTabIndex(newTab)} sx={{ flexGrow: 1 }}>
                  {tabs.map((tab, index) => (
                    <Tab
                      key={tab.id}
                      label={
                        <Box display="flex" alignItems="center">
                          {tab.title}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTab(tab.id);
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    />
                  ))}
                  <Tab label="+" onClick={handleAddTab} />
                </Tabs>

                <Box display="flex" alignItems="center" gap={1} paddingRight={2}>
                  <IconButton onClick={handlePrettyPrintQuery}><FormatAlignLeftIcon /></IconButton>
                  <IconButton onClick={handleCopyQuery}><ContentCopyIcon /></IconButton>
                  <IconButton onClick={handleClearEditor}><img src={ClearIcon} alt="ClearIcon" title="Clear" style={{ height: '14px' }} /></IconButton>
                  <IconButton onClick={handleExportQuery}><img src={FileDownloadIcon} alt="FileDownloadIcon" title="Download" style={{ height: '20px' }} /></IconButton>
                  <IconButton onClick={handleRunQuery}><img src={PlayArrowIcon} alt="PlayArrowIcon" title="Run Query" style={{ height: '20px' }} /></IconButton>
                  <IconButton onClick={handleToggleNavigator}><MenuIcon /></IconButton>
                </Box>
              </Box>
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  style={{ display: activeTabIndex === index ? 'block' : 'none', height: 'calc(100% - 55px)', overflowY: 'auto', position: 'relative' }}
                >
                  <SQLEditor
                    value={tab.content}
                    onChange={(value) => setTabs((prevTabs) =>
                      prevTabs.map((tab, i) => (i === activeTabIndex ? { ...tab, content: value } : tab))
                    )}
                    onDrop={(editor, event) => {
                      event.preventDefault();
                      const tablePath = event.dataTransfer.getData('text/plain');
                      const doc = editor.state.doc;
                      editor.dispatch({
                        changes: { from: doc.length, insert: `[${tablePath}]` },
                      });
                      setTabs((prevTabs) =>
                        prevTabs.map((tab, i) =>
                          i === activeTabIndex ? { ...tab, content: doc.toString() + `[${tablePath}]` } : tab
                        )
                      );
                    }}
                    onDragOver={(event) => event.preventDefault()}
                  />
                  <Button variant="outlined" onClick={handleOpenModal} sx={{ position: 'absolute', bottom: '20%', right: '10px', height: '60px', width: '60px', borderRadius: '30px' }}><img alt={'prompt'} src={magicwandIcon} height={24}></img></Button>
                </div>
              ))}
            </div>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
              {gridData ? (
                <AgGridReact
                  columnDefs={gridData.columns.map(col => ({
                    headerName: col.columnName,
                    field: col.columnName,
                    type: col.dataType === 'integer' ? 'numericColumn' : 'textColumn'
                  }))}
                  rowData={gridData.rows}
                />
              ) : (
                <div className="previewGrid">Run a query to see results here</div>
              )}
            </div>
          </FlexiSplit>
        </div>
        <div>
          <h5 className='m-3'>Selected Source: {selectedSource.name}</h5>
          <DatabaseTree selectedSourceName={selectedSource.name} onDragStart={(e, tablePath) => e.dataTransfer.setData('text/plain', tablePath)} />
        </div>
      </FlexiSplit>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            width: '540px',
            margin: '100px auto',
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            position: 'relative',
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Typography variant="h6" component="h2">
              Prompt
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <AiQueryPopup onInsertText={handleInsertText} />
        </Box>
      </Modal>
    </div>
  );
};

export default StepQuery;
