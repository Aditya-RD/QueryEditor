// StepQuery.js
import React, { useRef, useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  IconButton,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
import ContentCopyIcon from './assets/images/copy-icon.svg';
import FormatAlignLeftIcon from './assets/images/beautify-icon.svg';
import RefreshIcon from './assets/images/refresh.svg';
import SearchIcon from './assets/images/search.svg';
import MenuIcon from './assets/images/right-arrow-navigator.svg';
import LeftArrow from './assets/images/left-arrow-navigator.svg';


const SQLEditor = ({ value, onChange, onDrop, onDragOver }) => {
  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
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
  const isGenAI = window.location.href.includes("gen-ai");
  const [tabs, setTabs] = useState([{
    id: 0,
    title: 'Worksheet 1',
    content: '',
    promptOpen: isGenAI,
    gridData: null,
    splitterOptions: {
      percentage1: 50,
      percentage2: 50,
      minSize1: 100,
      minSize2: 100,
      gutterSize: 2,
      direction: 'vertical',
      collapseButtonVisible: true,
      initiallyCollapsed: true,
    }
  }]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [nextTabId, setNextTabId] = useState(1);
  //const [gridData, setGridData] = useState(null);
  //const [openModal, setOpenModal] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false); // Add loading state
  const [loading, setLoading] = useState(false); // Add loading state

  // const handleOpenModal = () => setOpenModal(true);
  // const handleCloseModal = () => setOpenModal(false);

  const [parentSplitOptions] = useState({
    percentage1: 70,
    percentage2: 30,
    minSize1: 100,
    minSize2: 100,
    gutterSize: 2,
    direction: 'horizontal',
    collapseButtonVisible: false,
    initiallyCollapsed: true,
  });
  // const [childSplitOptions] = useState({
  //   percentage1: 50,
  //   percentage2: 50,
  //   minSize1: 100,
  //   minSize2: 100,
  //   gutterSize: 2,
  //   direction: 'vertical',
  //   collapseButtonVisible: true,
  //   initiallyCollapsed: true,
  // });

  // const handleOpenModal = () => setOpenModal(true);
  // const handleCloseModal = () => setOpenModal(false);

  // Refs for parent and child FlexiSplit
  const parentFlexiSplitRef = useRef(null);
  const childFlexiSplitRefs = useRef({});

  // Handlers for the parent FlexiSplit
  const handleExpandParentPanel = () => {
    parentFlexiSplitRef.current.expandPanel();
  };

  const handleCollapseParentPanel = () => {
    parentFlexiSplitRef.current.collapsePanel();
  };

  const handleToggleParentCollapse = () => {
    parentFlexiSplitRef.current.toggleCollapse();
  };

  // Handlers for the child FlexiSplit
  const handleExpandChildPanel = (tabId) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, splitterOptions: {...tab.splitterOptions, initiallyCollapsed: false }} : tab
      )
    );
    const splitRef = childFlexiSplitRefs.current[tabId];
    if (splitRef) {
      splitRef.expandPanel();
    }
  };

  const handleCollapseChildPanel = (tabId) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, splitterOptions: {...tab.splitterOptions, initiallyCollapsed: true }} : tab
      )
    );
    const splitRef = childFlexiSplitRefs.current[tabId];
    if (splitRef) {
      splitRef.collapsePanel();
    }
  };

  const handleToggleChildCollapse = (tabId) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, splitterOptions: {...tab.splitterOptions, initiallyCollapsed: !tab.splitterOptions }} : tab
      )
    );
    const splitRef = childFlexiSplitRefs.current[tabId];
    if (splitRef) {
      splitRef.toggleCollapse();
    }
  };

  const handleTogglePrompt = () => {
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, promptOpen: !tab.promptOpen } : tab
      )
    );
  };

  const handleInsertText = async (text) => {
    setLoading(true); // Start loading
    try {
      const response = await fetch('http://127.0.0.1:5000/get_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      const outputText = result.output;
      setTabs((prevTabs) =>
        prevTabs.map((tab, i) =>
          i === activeTabIndex ? { ...tab, content: tab.content + outputText } : tab
        )
      );
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setLoading(false); // Stop loading
      handleTogglePrompt();
    }
  };

  const handleAddTab = () => {
    const isGenAI = window.location.href.includes("gen-ai");
    const newTab = {
      id: nextTabId,
      title: `Worksheet ${nextTabId + 1}`,
      content: '',
      promptOpen: isGenAI,
      gridData: null,
      splitterOptions: {
        percentage1: 50,
        percentage2: 50,
        minSize1: 100,
        minSize2: 100,
        gutterSize: 2,
        direction: 'vertical',
        collapseButtonVisible: true,
        initiallyCollapsed: true,
      }
    };
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
    const activeTab = tabs[activeTabIndex];
    const activeQuery = tabs[activeTabIndex].content;
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id ? { ...tab, gridData: null } : tab
      )
    );
    handleExpandChildPanel(activeTab.id);
    setResultsLoading(true);
    const data = await executeQuery(activeQuery);

    setResultsLoading(false);
    if (data) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, gridData: data } : tab
        )
      );
    } else {
      alert('error');
    }
    setResultsLoading(false);
  };
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <FlexiSplit
        ref={parentFlexiSplitRef}
        element1Id="panel1"
        element2Id="panel2"
        options={parentSplitOptions}
      >
        <div style={{ height: '100%', overflowY: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <Tabs value={activeTabIndex} onChange={(e, newTab) => setActiveTabIndex(newTab)} sx={{ flexGrow: 1 }}>
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  label={
                    <Box display="flex" alignItems="center" sx={{
                      '& .close-icon': {
                        visibility: 'hidden',
                      },
                      '&:hover .close-icon': {
                        visibility: 'visible',
                      },
                    }}>
                      {tab.title}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTab(tab.id);
                        }}
                        className="close-icon">
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
              <Tab label="+" onClick={handleAddTab} />
            </Tabs>
            <Box display="flex" alignItems="center" gap={1} paddingRight={2}>
              <IconButton onClick={handlePrettyPrintQuery}><img src={FormatAlignLeftIcon} alt="FormatAlignLeftIcon" title="Pretty Print" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleCopyQuery}><img src={ContentCopyIcon} alt="ContentCopyIcon" title="Copy" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleClearEditor}><img src={ClearIcon} alt="ClearIcon" title="Clear" style={{ height: '14px' }} /></IconButton>
              <IconButton onClick={handleExportQuery}><img src={FileDownloadIcon} alt="FileDownloadIcon" title="Download" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleRunQuery}><img src={PlayArrowIcon} alt="PlayArrowIcon" title="Run Query" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleToggleParentCollapse}><img src={MenuIcon} alt="MenuIcon" title="Navigator" style={{ height: '16px' }} /></IconButton>
            </Box>
          </Box>
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              style={{
                display: activeTabIndex === index ? 'block' : 'none',
                height: 'calc(100% - 55px)',
                overflowY: 'hidden',
                position: 'relative'
              }}
            >
              <FlexiSplit
                ref={(el) => (childFlexiSplitRefs.current[tab.id] = el)}
                element1Id={`paneli1-${tab.id}`}
                element2Id={`paneli2-${tab.id}`}
                options={tab.splitterOptions}
              >
                {/* Paneli1 - SQL Editor, magic wand button, and prompt overlay */}
                <div style={{ height: '100%', border: '1px solid #b0b1b2', position: 'relative' }}>
                  {/* SQL Editor */}
                  <SQLEditor
                    value={tab.content}
                    onChange={(value) => setTabs((prevTabs) =>
                      prevTabs.map((tab, i) => (i === activeTabIndex ? { ...tab, content: value } : tab))
                    )}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => handleTogglePrompt(tab.id)}
                    sx={{
                      position: 'absolute',
                      bottom: '20%',
                      right: '10px',
                      height: '60px',
                      width: '60px',
                      borderRadius: '30px',
                    }}
                  >
                    <img alt="prompt" src={magicwandIcon} height={24} />
                  </Button>
                  {/* Prompt Overlay */}
                  {tab.promptOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      zIndex: 10,
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      alignItems: 'center'
                    }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" width={'500px'} backgroundColor={'#f5f5f5'} borderRadius={'12px 12px 0 0'}>
                        <Typography variant="h6" paddingLeft={'10px'}>Prompt</Typography>
                        <IconButton onClick={handleTogglePrompt}><CloseIcon /></IconButton>
                      </Box>
                      {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px" width={'500px'} backgroundColor={'#f5f5f5'} borderRadius={'0 0 12px 12px'}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <AiQueryPopup onInsertText={handleInsertText} />
                      )}
                    </div>
                  )}
                </div>

                {/* Paneli2 - AgGrid */}
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                  {resultsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                      <CircularProgress />
                    </Box>
                  ) : (
                    tab.gridData ? (
                      <AgGridReact
                        columnDefs={tab.gridData.columns.map(col => ({
                          headerName: col.columnName,
                          field: col.columnName,
                          type: col.dataType === 'integer' ? 'numericColumn' : 'textColumn',
                        }))}
                        rowData={tab.gridData.rows}
                      />
                    ) : (
                      <div className="previewGrid">Run a query to see results here</div>
                    )
                  )}
                </div>
              </FlexiSplit>
            </div>
          ))}
        </div>
        <div style={{ height: '100%' }}>
          <h5 className="p-3 m-0" style={{ height: '55px', borderBottom: '1px solid #ccc' }}>
            Source: {selectedSource.name}
            <div style={{ float: 'right', display: 'flex', alignItems: 'center', gap: '15px', height: '25px' }}>
              <img src={RefreshIcon} alt="RefreshIcon" title="Refresh" style={{ height: '22px' }} />
              <img src={SearchIcon} alt="SearchIcon" title="Search" style={{ height: '18px' }} />
              <img src={LeftArrow} alt="LeftArrow" title="Collapse" style={{ height: '18px' }} />
            </div>
          </h5>
          <DatabaseTree selectedSourceName={selectedSource.name} onDragStart={(e, tablePath) => e.dataTransfer.setData('text/plain', tablePath)} />
        </div>
      </FlexiSplit>
    </div>
  );
};

export default StepQuery;
