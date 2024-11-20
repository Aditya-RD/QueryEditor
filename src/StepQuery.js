// StepQuery.js
import React, { useRef, useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  IconButton,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DatabaseTree from './DatabaseTree';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import FlexiSplit from './FlexiSplit';
import { format } from 'sql-formatter';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './StepQuery.css';
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
import SettingIcon from './assets/images/Tile View.svg';
import SaveIcon from './assets/images/save-icon.svg';
import UploadIcon from './assets/images/upload-icon.svg';
import { executeQueryService } from './services/executeQuery.js';
import { genAiService } from './services/genAiService.js';
import { createWorksheet, deleteWorksheet, updateWorksheet } from './services/worksheets.js';
import { getWorksheetExecutedQueries } from './services/executedQueries.js';
import { getWorksheetSavedQueries } from './services/savedQueries.js';
import { createWorksheetExecutedQuery } from './services/executedQueries.js';
import { createWorksheetSavedQuery } from './services/savedQueries.js';
import * as XLSX from 'xlsx';

const SQLEditor = ({ value, onBlur, onCreateEditor }) => {
  const editorRef = useRef(null);
  return (
    <div
      style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <CodeMirror
        value={value}
        extensions={[sql()]}
        options={{
          lineNumbers: true,
          lineWrapping: true,
        }}
        onCreateEditor={(editor) => {
          editorRef.current = editor;
          if (onCreateEditor) onCreateEditor(editor);
        }}
        onBlur={() => {
          if (editorRef.current) {
            const content = editorRef.current.state.doc.toString();
            onBlur(content); // Call onBlur with the current content
          }
        }}
        style={{ height: '100%', overflow: 'auto' }}
      />
    </div>
  );
};

// StepQuery component begins here
const StepQuery = ({ workbookId, selectedSource, queryData, setQueryData, optionType, tabs, setTabs, activeTabIndex, setActiveTabIndex, nextTabNumber, setNextTabNumber }) => {
  const isGenAI = optionType === 'gen-ai';
  const [editingTabId, setEditingTabId] = useState(null);

  const [loading, setLoading] = useState(false);
  const editorRefs = useRef({});
  const fileInputRef = useRef(null);

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
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');

  const parentFlexiSplitRef = useRef(null);
  const childFlexiSplitRefs = useRef({});

  useEffect(() => {
    // Update the content in the parent state whenever it changes
    setQueryData(tabs[activeTabIndex]?.content);
  }, [tabs, activeTabIndex, setQueryData]);

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
        index === activeTabIndex ? { ...tab, splitterOptions: { ...tab.splitterOptions, initiallyCollapsed: false } } : tab
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
        index === activeTabIndex ? { ...tab, splitterOptions: { ...tab.splitterOptions, initiallyCollapsed: true } } : tab
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
        index === activeTabIndex ? { ...tab, splitterOptions: { ...tab.splitterOptions, initiallyCollapsed: !tab.splitterOptions.initiallyCollapsed } } : tab
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

      const result = await genAiService(text);
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

  const handleAddTab = async () => {
    const new_ws = await createWorksheet({
      workbookId: workbookId,
      name: `Worksheet ${nextTabNumber}`,
      editorText: "",
      designConfig: ""
    });
    if (new_ws.worksheetId) {
      const newTab = {
        id: new_ws.worksheetId,
        title: `Worksheet ${nextTabNumber}`,
        content: '',
        promptOpen: isGenAI,
        innerTabIndex: 2,
        resultsGridData: null,
        resultsGridLoading: false,
        executedQueriesGridData: null,
        executedQueriesGridLoading: false,
        savedQueriesGridData: null,
        savedQueriesGridLoading: false,
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
      };
      setTabs((prevTabs) => [...prevTabs, newTab]);
      setActiveTabIndex(tabs.length);
      setNextTabNumber(nextTabNumber + 1);
    } else {
      alert('problem creating tab');
    }
  };

  const handleDeleteTab = async (tabId) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);

    const delete_tab_res = await deleteWorksheet(tabId);
    if (delete_tab_res === "ok") {
      const updatedTabs = tabs.filter((tab) => tab.id !== tabId);
      if (updatedTabs.length === 0) {
        setActiveTabIndex(0);
      } else if (tabIndex <= activeTabIndex) {
        setActiveTabIndex(Math.max(0, activeTabIndex - 1));
      }
      setTabs(updatedTabs);
    }
  };

  const handleCopyQuery = () => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    // Get the current document and selection from the editor
    const { state } = editor;
    const selection = state.selection.main;

    let queryText = '';

    if (!selection.empty) {
      // If text is selected, use the selected text
      queryText = state.doc.sliceString(selection.from, selection.to);
    } else {
      // If no text is selected, use the entire content
      queryText = state.doc.toString();
    }
    navigator.clipboard.writeText(queryText);
    alert('Query copied to clipboard');
  };

  const handlePrettyPrintQuery = () => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    const { state, dispatch } = editor;
    const selection = state.selection.main;

    let from = 0;
    let to = state.doc.length;
    let textToFormat = state.doc.toString();

    if (!selection.empty) {
      // Text is selected
      from = selection.from;
      to = selection.to;
      textToFormat = state.doc.sliceString(from, to);
    }

    try {
      // Use the 'format' function directly
      const formattedText = format(textToFormat);

      // Replace the selected text with formatted text
      dispatch({
        changes: { from, to, insert: formattedText },
      });
    } catch (error) {
      console.error('Formatting failed:', error);
      alert('Failed to format SQL. Please check your syntax.');
    }
  };

  const handleExportQuery = () => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    // Get the current document and selection from the editor
    const { state } = editor;
    const selection = state.selection.main;

    let queryText = '';

    if (!selection.empty) {
      // If text is selected, use the selected text
      queryText = state.doc.sliceString(selection.from, selection.to);
    } else {
      // If no text is selected, use the entire content
      queryText = state.doc.toString();
    }

    // Create a Blob from the query text and initiate download
    const element = document.createElement('a');
    const file = new Blob([queryText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab.title}_query.txt`; // Customize the file name as needed
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // New function to execute the query and fetch results
  const executeQuery = async (queryText) => {
    try {
      const activeTab = tabs[activeTabIndex];
      const result = await executeQueryService({ queryText: queryText });
      if (result.flag && result.data && result.columns) {
        await createWorksheetExecutedQuery({
          worksheetId: activeTab.id,
          queryText: queryText,
          executionResult: "success"
        })
        return {
          columns: JSON.parse(result.columns),
          rows: JSON.parse(result.data)
        };
      } else {
        await createWorksheetExecutedQuery({
          worksheetId: activeTab.id,
          queryText: queryText,
          executionResult: "failed"
        })
        throw new Error('Failed to retrieve data');
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      return null;
    }
  };

  //Fileupload
  const handleUploadQuery = () => {
    // Trigger the file input click when the IconButton is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  //UploadQuery
  const handleFileUpload = (event) => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    if (!event.target.files || event.target.files.length === 0) {
      console.error('No file selected');
      return;
    }

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const uploadedQuery = e.target.result;

      // Get the current content of the editor
      const currentContent = editor.state.doc.toString();

      // Combine current content with uploaded content, adding a newline if necessary
      const newContent = currentContent
        ? `${currentContent}\n${uploadedQuery}`
        : uploadedQuery;

      // Update the editor content
      const { dispatch } = editor;
      dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: newContent,
        },
      });

      // Update the tab's content in state
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, content: newContent } : tab
        )
      );
    };

    reader.readAsText(file);

    // Reset file input to allow re-uploading the same file if needed
    event.target.value = '';
  };

  const handleClearEditor = () => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    const { state, dispatch } = editor;
    const selection = state.selection.main;

    let from = 0;
    let to = state.doc.length;

    if (!selection.empty) {
      // Text is selected
      from = selection.from;
      to = selection.to;
    }

    // Clear selected text or entire content if nothing is selected
    dispatch({
      changes: { from, to, insert: '' },
    });

    // Update the state with the available text in the editor
    const updatedText = state.doc.sliceString(0, state.doc.length);
    setTabs((prevTabs) =>
      prevTabs.map((tab, index) =>
        index === activeTabIndex ? { ...tab, content: updatedText } : tab
      )
    );
  };

  const handleRunQuery = async () => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    const { state } = editor;
    const selection = state.selection.main;

    let queryText = '';

    if (!selection.empty) {
      // Text is selected
      queryText = state.doc.sliceString(selection.from, selection.to);
    } else {
      // No text selected; use entire content
      queryText = state.doc.toString();
    }

    // Clear previous grid data and set resultsGridLoading to true for this tab
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? { ...tab, resultsGridData: null, innerTabIndex: 2, resultsGridLoading: true }
          : tab
      )
    );

    // Expand the result panel
    handleExpandChildPanel(activeTab.id);

    try {
      // Execute the query
      const data = await executeQuery(queryText);

      if (data) {
        // Update the grid data with the new results and set resultsGridLoading to false
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTab.id
              ? { ...tab, resultsGridData: data, innerTabIndex: 2, resultsGridLoading: false }
              : tab
          )
        );
      } else {
        alert('Failed to retrieve data');
        // Set resultsGridLoading to false in case of failure
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTab.id ? { ...tab, resultsGridLoading: false } : tab
          )
        );
      }
    } catch (error) {
      console.error('Query execution failed:', error);
      alert('An error occurred while executing the query.');
      // Set resultsGridLoading to false in case of error
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, resultsGridLoading: false } : tab
        )
      );
    }
  };

  // Add the handler function
  const handleTabTitleChange = async (tabId, newTitle) => {
    const tab_name_update_res = await updateWorksheet(tabId, {
      name: newTitle
    });
    if (tab_name_update_res === "ok") {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => (tab.id === tabId ? { ...tab, title: newTitle } : tab))
      );
    } else {
      alert('problem updating tab name');
    }
  };

  const handleTabEditorContentChange = async (tabId, newContent) => {
    const tab_editorcontent_update_res = await updateWorksheet(tabId, {
      editorText: newContent
    });
    if (tab_editorcontent_update_res === "ok") {
      setTabs((prevTabs) =>
        prevTabs.map((tab) => (tab.id === tabId ? { ...tab, content: newContent } : tab))
      );
    } else {
      alert('problem updating tab editor content');
    }
  };

  //ExcelDownload
  const handleDownloadQueryResult = () => {
    const activeTab = tabs[activeTabIndex];
    let dataToDownload = [];
    let sheetName = '';

    switch (activeTab.innerTabIndex) {
      case 0: // Saved Queries
        if (activeTab.savedQueriesGridData) {
          dataToDownload = activeTab.savedQueriesGridData; // Assume this is an array of objects representing each row
          sheetName = 'SavedQueries';
        } else {
          alert('No data to export in Results');
          return;
        }
        break;
      case 1: // Executed Queries
        if (activeTab.executedQueriesGridData) {
          dataToDownload = activeTab.executedQueriesGridData; // Assume this is an array of objects representing each row
          sheetName = 'ExecutedQueries';
        } else {
          alert('No data to export in Results');
          return;
        }
        break;
      case 2: // Result
        if (activeTab.resultsGridData) {
          dataToDownload = activeTab.resultsGridData.rows; // Assume this is an array of objects representing each row
          sheetName = 'Results';
        } else {
          alert('No data to export in Results');
          return;
        }
        break;
      default:
        alert('No data available for export');
        return;
    }

    if (dataToDownload.length === 0) {
      alert('No data available for export');
      return;
    }

    // Generate a worksheet from the data array
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate and download Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${activeTab.title}_${sheetName}.xlsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  //SaveQuery
  const handleOpenSaveDialog = () => {
    setQueryName(''); // Reset the input field
    setSaveDialogOpen(true);
  };

  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  const handleConfirmSaveQuery = async () => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    const { state } = editor;
    const selection = state.selection.main;

    let queryText = '';

    if (!selection.empty) {
      // Text is selected
      queryText = state.doc.sliceString(selection.from, selection.to);
    } else {
      // No text selected; use entire content
      queryText = state.doc.toString();
    }

    if (queryName.trim() === '') {
      alert('Query Name is required!');
      return;
    }

    try {
      await createWorksheetSavedQuery({
        worksheetId: activeTab.id,
        queryText: queryText,
        queryName: queryName.trim(),
      });
      alert('Query saved successfully');
    } catch (error) {
      console.error('Failed to save query:', error);
      alert('Error saving query');
    } finally {
      handleCloseSaveDialog();
    }
  };
  // const handleSaveQuery = async () => {
  //   const activeTab = tabs[activeTabIndex];
  //   const editor = editorRefs.current[activeTab.id];

  //   if (!editor) {
  //     console.error('Editor not found for active tab');
  //     return;
  //   }

  //   const { state } = editor;
  //   const selection = state.selection.main;

  //   let queryText = '';

  //   if (!selection.empty) {
  //     // Text is selected
  //     queryText = state.doc.sliceString(selection.from, selection.to);
  //   } else {
  //     // No text selected; use entire content
  //     queryText = state.doc.toString();
  //   }
  //   await createWorksheetSavedQuery({
  //     worksheetId: activeTab.id,
  //     queryText: queryText
  //   })
  //   alert('Query saved successfully');
  // };

  // Handlers for fetching executed queries
  const fetchExecutedQueries = async (worksheetId) => {
    const activeTab = tabs[activeTabIndex];
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? { ...tab, executedQueriesGridData: null, executedQueriesGridLoading: true }
          : tab
      )
    );

    try {
      const data = await getWorksheetExecutedQueries(worksheetId);
      const dataMod = data.map((obj) => {
        obj.ExecutedBy = "Nidhi";
        return obj;
      })
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id
            ? { ...tab, executedQueriesGridData: dataMod, executedQueriesGridLoading: false }
            : tab
        )
      );
    } catch (error) {
      console.error('Failed to fetch executed queries:', error);
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, executedQueriesGridLoading: false } : tab
        )
      );
    }
  };

  // Handlers for fetching saved queries
  const fetchSavedQueries = async (worksheetId) => {
    const activeTab = tabs[activeTabIndex];
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTab.id
          ? { ...tab, savedQueriesGridData: null, savedQueriesGridLoading: true }
          : tab
      )
    );

    try {
      const data = await getWorksheetSavedQueries(worksheetId);
      const dataMod = data.map((obj) => {
        obj.SavedBy = "Aditya";
        return obj;
      })
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id
            ? { ...tab, savedQueriesGridData: dataMod, savedQueriesGridLoading: false }
            : tab
        )
      );
    } catch (error) {
      console.error('Failed to fetch saved queries:', error);
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, savedQueriesGridLoading: false } : tab
        )
      );
    }
  };

  const handleCellDoubleClick = (event) => {
    const activeTab = tabs[activeTabIndex];
    const editor = editorRefs.current[activeTab.id];

    if (!editor) {
      console.error('Editor not found for active tab');
      return;
    }

    const { data, colDef } = event;
    // Check if the clicked column is either "Saved Query" or "Executed Result"
    if (colDef.field === 'QueryText') {
      const queryText = data.QueryText;

      // Append the query text to the current content in the editor
      const currentContent = editor.state.doc.toString();
      const newContent = `${currentContent}\n${queryText}`;

      const { dispatch } = editor;
      dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: newContent },
      });

      // Update the state with the new content in the editor
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTab.id ? { ...tab, content: newContent } : tab
        )
      );
    }
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
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        '& .close-icon': {
                          visibility: 'hidden',
                        },
                        '&:hover .close-icon': {
                          visibility: 'visible',
                        },
                      }}
                    >
                      {editingTabId === tab.id ? (
                        <TextField
                          value={tab.title}
                          onChange={(e) => setTabs((prevTabs) =>
                            prevTabs.map((tabItem) => tabItem.id === tab.id ? { ...tabItem, title: e.target.value } : tabItem)
                          )}
                          onBlur={() => {
                            handleTabTitleChange(tab.id, tab.title);
                            setEditingTabId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleTabTitleChange(tab.id, tab.title);
                              setEditingTabId(null);
                            }
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          variant="standard"
                          size="small"
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingTabId(tab.id);
                          }}
                        >
                          {tab.title}
                        </span>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTab(tab.id);
                        }}
                        className="close-icon"
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
              <IconButton onClick={handlePrettyPrintQuery}><img src={FormatAlignLeftIcon} alt="FormatAlignLeftIcon" title="Pretty Print" style={{ height: '20px' }} /></IconButton>
              {/* <IconButton onClick={handleSaveQuery}><img src={SaveIcon} alt="SavequeryIcon" title="Save" style={{ height: '20px' }} /></IconButton> */}
              <IconButton onClick={handleOpenSaveDialog}><img src={SaveIcon} alt="SavequeryIcon" title="Save" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleCopyQuery}><img src={ContentCopyIcon} alt="ContentCopyIcon" title="Copy" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleClearEditor}><img src={ClearIcon} alt="ClearIcon" title="Clear" style={{ height: '14px' }} /></IconButton>
              <IconButton onClick={handleExportQuery}><img src={FileDownloadIcon} alt="FileDownloadIcon" title="Download Query" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleUploadQuery}><img src={UploadIcon} alt="UploadIconIcon" title="Upload Query" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleRunQuery}><img src={PlayArrowIcon} alt="PlayArrowIcon" title="Run Query" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleToggleParentCollapse}><img src={MenuIcon} alt="MenuIcon" title="Navigator" style={{ height: '16px' }} /></IconButton>
              {/* Hidden file input */}
              <input
                type="file"
                accept=".txt"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
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
                    onBlur={(value) => {
                      handleTabEditorContentChange(tab.id, value);
                    }}
                    onCreateEditor={(editor) => {
                      editorRefs.current[tab.id] = editor; // Store the editor instance
                    }}
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

                {/* Paneli2 - Tabs with Saved Queries, Executed Queries, and Result */}
                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                    <Tabs
                      value={tab.innerTabIndex}
                      // onChange={(e, newIndex) => {
                      //   // Update the innerTabIndex for this tab
                      //   setTabs(prevTabs =>
                      //     prevTabs.map((t, i) => i === activeTabIndex ? { ...t, innerTabIndex: newIndex } : t)
                      //   );
                      // }}
                      onChange={(e, newIndex) => {
                        // Update the innerTabIndex for this tab
                        setTabs(prevTabs =>
                          prevTabs.map((t, i) => i === activeTabIndex ? { ...t, innerTabIndex: newIndex } : t)
                        );

                        // Trigger data fetch based on the selected sub-tab
                        if (newIndex === 1) {
                          fetchExecutedQueries(tab.id);
                        } else if (newIndex === 0) {
                          fetchSavedQueries(tab.id);
                        }
                      }}
                      sx={{ flexGrow: 1 }}
                    >
                      <Tab label="Saved Queries" />
                      <Tab label="Executed Queries" />
                      <Tab label="Result" />
                    </Tabs>
                    <Box display="flex" alignItems="center" gap={1} paddingRight={2}>
                      <IconButton><img src={SettingIcon} alt="DataProductsIcon" title="Create Data Product" style={{ height: '20px' }} /></IconButton>
                      <IconButton onClick={handleDownloadQueryResult}><img src={FileDownloadIcon} alt="FileDownloadIcon" title="Download" style={{ height: '20px' }} /></IconButton>
                    </Box>
                  </Box>
                  <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {tab.innerTabIndex === 0 && (
                      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                        {tab.savedQueriesGridLoading ? (
                          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <CircularProgress />
                          </Box>
                        ) : (
                          tab.savedQueriesGridData ? (
                            <AgGridReact
                              columnDefs={[
                                { headerName: 'Query Name', field: 'QueryName', width: '300px' },
                                { headerName: 'Saved Query', field: 'QueryText', width: '500px' },
                                { headerName: 'Saved By', field: 'SavedBy' },
                                { headerName: 'Saved On', field: 'Timestamp' },
                              ]}
                              rowData={tab.savedQueriesGridData}
                              onCellDoubleClicked={handleCellDoubleClick} // Add this prop
                            />
                          ) : (
                            <div>No saved queries available.</div>
                          )
                        )}
                      </div>
                    )}
                    {tab.innerTabIndex === 1 && (
                      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                        {tab.executedQueriesGridLoading ? (
                          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <CircularProgress />
                          </Box>
                        ) : (
                          tab.executedQueriesGridData ? (
                            <AgGridReact
                              columnDefs={[
                                { headerName: 'Executed Query', field: 'QueryText', width: '500px' },
                                { headerName: 'Execution Result', field: 'ExecutionResult' },
                                { headerName: 'Executed By', field: 'ExecutedBy' },
                                { headerName: 'Executed On', field: 'Timestamp' },
                              ]}
                              rowData={tab.executedQueriesGridData}
                              onCellDoubleClicked={handleCellDoubleClick} // Add this prop
                            />
                          ) : (
                            <div>No executed queries available.</div>
                          )
                        )}
                      </div>
                    )}
                    {tab.innerTabIndex === 2 && (
                      // Content for Result
                      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                        {tab.resultsGridLoading ? (
                          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                            <CircularProgress />
                          </Box>
                        ) : (
                          tab.resultsGridData ? (
                            <AgGridReact
                              columnDefs={tab.resultsGridData.columns.map(col => ({
                                headerName: col.columnName,
                                field: col.columnName,
                                type: col.dataType === 'integer' ? 'numericColumn' : 'textColumn',
                                headerClass: 'custom-header',
                              }))}
                              rowData={tab.resultsGridData.rows}
                            />
                          ) : (
                            <div className="previewGrid">Run a query to see results here</div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </FlexiSplit>
            </div>
          ))}
        </div>
        <div style={{ height: '100%' }}>
          <h5 className="p-3 m-0" style={{ height: '55px', borderBottom: '1px solid #ccc' }}>
            Source: {selectedSource.name}
            <div style={{ float: 'right', display: 'flex', alignItems: 'center', gap: '10px', height: '25px' }}>
              <IconButton onClick={handleToggleParentCollapse}><img src={RefreshIcon} alt="NavRefreshIcon" title="Navigator Refresh" style={{ height: '20px' }} /></IconButton>
              <IconButton onClick={handleToggleParentCollapse}><img src={SearchIcon} alt="NavSearchIcon" title="Navigator Search" style={{ height: '16px' }} /></IconButton>
              <IconButton onClick={handleToggleParentCollapse}><img src={LeftArrow} alt="NavCloseIcon" title="Navigator Close" style={{ height: '16px' }} /></IconButton>
            </div>
          </h5>
          <DatabaseTree selectedSourceName={selectedSource.name} onDragStart={(e, tablePath) => e.dataTransfer.setData('text/plain', tablePath)} />
        </div>
      </FlexiSplit>
      {/* Save Query Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={handleCloseSaveDialog}
        maxWidth="md" // Sets the maximum width of the dialog
        fullWidth // Makes the dialog take the full width up to the maxWidth
        PaperProps={{
          sx: { // Custom styles for the dialog box
            width: '600px', // Adjust width as needed
            height: '300px', // Adjust height as needed
            padding: '20px', // Add padding for a better look
            borderRadius: '12px', // Rounded corners
          },
        }}
      >
        <DialogTitle sx={{padding:'0 0 5px 0', borderBottom:'1px solid blue'}}>Save Query</DialogTitle>
        <DialogContent>
          <TextField
            label="Query Name"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            fullWidth
            variant="outlined"
            autoFocus
            sx={{
              marginTop: '40px'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog}>Cancel</Button>
          <Button onClick={handleConfirmSaveQuery} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default StepQuery;
