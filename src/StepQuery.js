import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ClearIcon from '@mui/icons-material/Clear';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import FlexiSplit from './FlexiSplit'; // Assuming FlexiSplit is a custom or local component
import './App.css';

const splitOptions = {
  percentage1: 30, // Set initial size of the first panel
  percentage2: 70, // Set initial size of the second panel
  minSize1: 100,
  minSize2: 100,
  gutterSize: 10,
  direction: 'horizontal', 
  collapseButtonVisible: true,
  initiallyCollapsed: false,
};

// Fetch mock child nodes
const fetchChildNodes = (nodeId, nodeType) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (nodeType === 'database') {
        resolve([
          { id: `${nodeId}-schema1`, name: 'Schema 1', type: 'schema', parent: nodeId },
          { id: `${nodeId}-schema2`, name: 'Schema 2', type: 'schema', parent: nodeId },
        ]);
      } else if (nodeType === 'schema') {
        resolve([
          { id: `${nodeId}-table1`, name: 'Table 1', type: 'table', parent: nodeId },
          { id: `${nodeId}-table2`, name: 'Table 2', type: 'table', parent: nodeId },
        ]);
      } else {
        resolve([]);
      }
    }, 1000);
  });
};

const TreeNode = ({ node, level = 0, parentPath = '', onDragStart }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState(null);
  const fullPath = `${parentPath ? `${parentPath}.` : ''}${node.name}`;

  const handleToggle = async () => {
    setOpen((prevOpen) => !prevOpen);
    if (!children && !loading) {
      setLoading(true);
      try {
        const fetchedChildren = await fetchChildNodes(node.id, node.type);
        setChildren(fetchedChildren);
      } catch (error) {
        console.error('Failed to fetch child nodes:', error);
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingLeft: level * 16 }}>
      <ListItem
        button
        onClick={handleToggle}
        draggable={node.type === 'table'}
        onDragStart={(event) => onDragStart(event, fullPath)}
      >
        <IconButton size="small">
          {open ? <ExpandMoreIcon /> : <ChevronRightIcon />}
        </IconButton>
        <ListItemText primary={node.name} />
      </ListItem>
      {loading && (
        <div style={{ paddingLeft: (level + 1) * 16 }}>
          <CircularProgress size={20} />
        </div>
      )}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children &&
            children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                parentPath={fullPath}
                onDragStart={onDragStart}
              />
            ))}
        </List>
      </Collapse>
    </div>
  );
};

const DatabaseTree = ({ onDragStart }) => {
  const initialData = [
    { id: 'db1', name: 'Database 1', type: 'database' },
    { id: 'db2', name: 'Database 2', type: 'database' },
  ];

  return (
    <List>
      {initialData.map((db) => (
        <TreeNode key={db.id} node={db} onDragStart={onDragStart} />
      ))}
    </List>
  );
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

const StepQuery = () => {
  const [tabs, setTabs] = useState([{ id: 0, title: 'Query 1', content: '' }]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [nextTabId, setNextTabId] = useState(1);

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

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <FlexiSplit element1Id="panel1" element2Id="panel2" options={splitOptions}>
        <div>
          <DatabaseTree onDragStart={(e, tablePath) => e.dataTransfer.setData('text/plain', tablePath)} />
        </div>
        <div>
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
              <IconButton onClick={() => handlePrettyPrintQuery()}><FormatAlignLeftIcon /></IconButton>
              <IconButton onClick={() => handleCopyQuery()}><ContentCopyIcon /></IconButton>
              <IconButton onClick={() => handleClearEditor()}><ClearIcon /></IconButton>
              <IconButton onClick={() => handleExportQuery()}><FileDownloadIcon /></IconButton>
              <IconButton onClick={() => alert('Run query clicked')}><PlayArrowIcon /></IconButton>
            </Box>
          </Box>
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              style={{ display: activeTabIndex === index ? 'block' : 'none', height: '100%' }}
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
            </div>
          ))}
        </div>
      </FlexiSplit>
    </div>
  );
};

export default StepQuery;
