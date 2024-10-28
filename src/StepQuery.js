import React, { useState, useEffect } from 'react';
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
  ListItemIcon,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import StorageIcon from '@mui/icons-material/Storage'; // Database icon
import FolderIcon from '@mui/icons-material/Folder'; // Schema icon
import TableChartIcon from '@mui/icons-material/TableChart'; // Table icon
import ViewColumnIcon from '@mui/icons-material/ViewColumn'; // Column icon
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import FlexiSplit from './FlexiSplit';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './App.css';

const splitOptions = {
  percentage1: 70,
  percentage2: 30,
  minSize1: 100,
  minSize2: 100,
  gutterSize: 2,
  direction: 'horizontal',
  collapseButtonVisible: true,
  initiallyCollapsed: false,
};

const splitOptionsi = {
  percentage1: 70,
  percentage2: 30,
  minSize1: 100,
  minSize2: 100,
  gutterSize: 2,
  direction: 'vertical',
  collapseButtonVisible: true,
  initiallyCollapsed: false,
};

// The fetch function for dynamic loading of children nodes
const fetchChildNodes = async (nodeId, nodeType, selectedSourceName, parentCatalog = null, parentSchema = null) => {
  if (nodeType === 'catalog') { // Fetch schemas when expanding a catalog
    try {
      const response = await fetch('https://dx-qast.getrightdata.com/dweb/queryasservice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSQkZRb3QzQndkeW03dFJfWlk4U3RtR1RYUHRrV3N6Sk05Y1djamJOV3AwIn0.eyJleHAiOjE3MzAyMTQwMjMsImlhdCI6MTczMDEyNzYyMywiYXV0aF90aW1lIjoxNzMwMTI3NjIxLCJqdGkiOiIyMjE5MTE5Zi0wMDE2LTRjMTUtYmUxMC0wNzc4MDJmNDI2MjQiLCJpc3MiOiJodHRwczovL2R4LXFhc3QuZ2V0cmlnaHRkYXRhLmNvbTo5NDQzL3JlYWxtcy9kZXh0cnVzIiwiYXVkIjoiZGF0YS1tYXJrZXQiLCJzdWIiOiI1NDUwMDg3Ny1jMDc5LTQwYjctOWRhNC1mNGM0ODFjNDk4MmQiLCJ0eXAiOiJJRCIsImF6cCI6ImRhdGEtbWFya2V0Iiwibm9uY2UiOiI4ZDY0N2FiMi1mYjQyLTQ5ZmYtYjhlMy0wMjIxZWJmNTdkOGEiLCJzZXNzaW9uX3N0YXRlIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiYXRfaGFzaCI6IkVsQ2sxSWlzUlRkSi02cFZ5cUt1Z3ciLCJhY3IiOiIxIiwic2lkIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiaXNEZlVzZXIiOnRydWUsImlzQ29uc3VtZXIiOnRydWUsInN1YiI6IkRYQURNSU46MSIsImNsaWVudElkIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3NSb2xlcyI6WyJncy5keGFkbWluLXJvbGUiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJvbmx5RGF0YU1hcmtldEFsbG93ZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImdpdmVuX25hbWUiOiJEYXZpZCIsInVzZXJOYW1lIjoiRGF2aWQiLCJ1c2VySWQiOiIxIiwidXVpZCI6IjU0NTAwODc3LWMwNzktNDBiNy05ZGE0LWY0YzQ4MWM0OTgyZCIsIm5hbWUiOiJEYXZpZCBhZG1pbiIsInVzZXJFbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImJ1c2luZXNzT3duZXIiOnRydWUsImZhbWlseV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSJ9.TopTeVYJZUwbi-uMwL6JPAp-hwivY6rKmTzOA5DObdWmihQZwhgshQQU_-Qv-788G5TXpMJ0WCBku3UUq85Lszsuo-9YufQEH44FYZaIsRga-wZHHLseixRL-mOkM14q-RrWW7rKvk3Y5oxHUskLvczRRvG411W7cOhLFTJfUS3xjjm42wgWz2kaGVU70HJNw0NKEbrZwdzmQFnuWQJdz02de5q6UAT4ZxNyXklc9Zvz1hQ87UWozpwkwc3FrFirSA_SgPGDHqHTnXksyPgbsht-oLioL9oG7lxOsP8PRCk0jUwiRH0XEhWTlvyZfSPg58POfE7jB9fFIGlPMSj4pg`
        },
        body: JSON.stringify({
          config: JSON.stringify({
            sourceType: 'RDBMS_QUERY_SERVICE',
            source: {
              type: selectedSourceName,
              profileId: null,
              connectionInfo: {
                existingConnection: false,
                connectionJDBCURL: 'jdbc:sqlserver://10.10.20.203:1433',
                username: 'rd_db_load',
                password: 'J93EmKePkG/M9kzQTUxqcg==',
                className: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                schema: null,
                catalog: nodeId, // Use the expanded database name as catalog
              },
              sourceInfo: {},
              datasetJoins: null,
              purpose: 'schemaList',
              previewCount: 100,
            },
          }),
          variables: '',
        }),
      });

      const data = await response.json();

      if (data.schemas) {
        return data.schemas.map((schema) => ({
          id: `${nodeId}-${schema.SCHEMA_NAME}`,
          name: schema.SCHEMA_NAME,
          type: 'schema',
          parent: nodeId,
        }));
      }
      
      return []; // Return an empty array if no schemas are found
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      return [];
    }
  } else if (nodeType === 'schema') { // Fetch tables when expanding a schema
    try {
      const response = await fetch('https://dx-qast.getrightdata.com/dweb/queryasservice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSQkZRb3QzQndkeW03dFJfWlk4U3RtR1RYUHRrV3N6Sk05Y1djamJOV3AwIn0.eyJleHAiOjE3MzAyMTQwMjMsImlhdCI6MTczMDEyNzYyMywiYXV0aF90aW1lIjoxNzMwMTI3NjIxLCJqdGkiOiIyMjE5MTE5Zi0wMDE2LTRjMTUtYmUxMC0wNzc4MDJmNDI2MjQiLCJpc3MiOiJodHRwczovL2R4LXFhc3QuZ2V0cmlnaHRkYXRhLmNvbTo5NDQzL3JlYWxtcy9kZXh0cnVzIiwiYXVkIjoiZGF0YS1tYXJrZXQiLCJzdWIiOiI1NDUwMDg3Ny1jMDc5LTQwYjctOWRhNC1mNGM0ODFjNDk4MmQiLCJ0eXAiOiJJRCIsImF6cCI6ImRhdGEtbWFya2V0Iiwibm9uY2UiOiI4ZDY0N2FiMi1mYjQyLTQ5ZmYtYjhlMy0wMjIxZWJmNTdkOGEiLCJzZXNzaW9uX3N0YXRlIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiYXRfaGFzaCI6IkVsQ2sxSWlzUlRkSi02cFZ5cUt1Z3ciLCJhY3IiOiIxIiwic2lkIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiaXNEZlVzZXIiOnRydWUsImlzQ29uc3VtZXIiOnRydWUsInN1YiI6IkRYQURNSU46MSIsImNsaWVudElkIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3NSb2xlcyI6WyJncy5keGFkbWluLXJvbGUiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJvbmx5RGF0YU1hcmtldEFsbG93ZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImdpdmVuX25hbWUiOiJEYXZpZCIsInVzZXJOYW1lIjoiRGF2aWQiLCJ1c2VySWQiOiIxIiwidXVpZCI6IjU0NTAwODc3LWMwNzktNDBiNy05ZGE0LWY0YzQ4MWM0OTgyZCIsIm5hbWUiOiJEYXZpZCBhZG1pbiIsInVzZXJFbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImJ1c2luZXNzT3duZXIiOnRydWUsImZhbWlseV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSJ9.TopTeVYJZUwbi-uMwL6JPAp-hwivY6rKmTzOA5DObdWmihQZwhgshQQU_-Qv-788G5TXpMJ0WCBku3UUq85Lszsuo-9YufQEH44FYZaIsRga-wZHHLseixRL-mOkM14q-RrWW7rKvk3Y5oxHUskLvczRRvG411W7cOhLFTJfUS3xjjm42wgWz2kaGVU70HJNw0NKEbrZwdzmQFnuWQJdz02de5q6UAT4ZxNyXklc9Zvz1hQ87UWozpwkwc3FrFirSA_SgPGDHqHTnXksyPgbsht-oLioL9oG7lxOsP8PRCk0jUwiRH0XEhWTlvyZfSPg58POfE7jB9fFIGlPMSj4pg`
        },
        body: JSON.stringify({
          config: JSON.stringify({
            sourceType: 'RDBMS_QUERY_SERVICE',
            source: {
              type: selectedSourceName,
              profileId: null,
              connectionInfo: {
                existingConnection: false,
                connectionJDBCURL: 'jdbc:sqlserver://10.10.20.203:1433',
                username: 'rd_db_load',
                password: 'J93EmKePkG/M9kzQTUxqcg==',
                className: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                schema: nodeId.split('-')[1], // schema name
                catalog: parentCatalog, // Use the database name as catalog
              },
              sourceInfo: {},
              datasetJoins: null,
              purpose: 'tablesList',
              objectType: 'TABLE',
              previewCount: 100,
            },
          }),
          variables: '',
        }),
      });

      const data = await response.json();

      if (data.tables) {
        return data.tables.map((table) => ({
          id: `${nodeId}-${table.tableName}`,
          name: table.tableName,
          type: 'table',
          parent: nodeId,
        }));
      }

      return []; // Return an empty array if no tables are found
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      return [];
    }
  } else if (nodeType === 'table') { // Fetch columns when expanding a table
    try {
      const response = await fetch('https://dx-qast.getrightdata.com/dweb/queryasservice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSQkZRb3QzQndkeW03dFJfWlk4U3RtR1RYUHRrV3N6Sk05Y1djamJOV3AwIn0.eyJleHAiOjE3MzAyMTQwMjMsImlhdCI6MTczMDEyNzYyMywiYXV0aF90aW1lIjoxNzMwMTI3NjIxLCJqdGkiOiIyMjE5MTE5Zi0wMDE2LTRjMTUtYmUxMC0wNzc4MDJmNDI2MjQiLCJpc3MiOiJodHRwczovL2R4LXFhc3QuZ2V0cmlnaHRkYXRhLmNvbTo5NDQzL3JlYWxtcy9kZXh0cnVzIiwiYXVkIjoiZGF0YS1tYXJrZXQiLCJzdWIiOiI1NDUwMDg3Ny1jMDc5LTQwYjctOWRhNC1mNGM0ODFjNDk4MmQiLCJ0eXAiOiJJRCIsImF6cCI6ImRhdGEtbWFya2V0Iiwibm9uY2UiOiI4ZDY0N2FiMi1mYjQyLTQ5ZmYtYjhlMy0wMjIxZWJmNTdkOGEiLCJzZXNzaW9uX3N0YXRlIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiYXRfaGFzaCI6IkVsQ2sxSWlzUlRkSi02cFZ5cUt1Z3ciLCJhY3IiOiIxIiwic2lkIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiaXNEZlVzZXIiOnRydWUsImlzQ29uc3VtZXIiOnRydWUsInN1YiI6IkRYQURNSU46MSIsImNsaWVudElkIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3NSb2xlcyI6WyJncy5keGFkbWluLXJvbGUiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJvbmx5RGF0YU1hcmtldEFsbG93ZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImdpdmVuX25hbWUiOiJEYXZpZCIsInVzZXJOYW1lIjoiRGF2aWQiLCJ1c2VySWQiOiIxIiwidXVpZCI6IjU0NTAwODc3LWMwNzktNDBiNy05ZGE0LWY0YzQ4MWM0OTgyZCIsIm5hbWUiOiJEYXZpZCBhZG1pbiIsInVzZXJFbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImJ1c2luZXNzT3duZXIiOnRydWUsImZhbWlseV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSJ9.TopTeVYJZUwbi-uMwL6JPAp-hwivY6rKmTzOA5DObdWmihQZwhgshQQU_-Qv-788G5TXpMJ0WCBku3UUq85Lszsuo-9YufQEH44FYZaIsRga-wZHHLseixRL-mOkM14q-RrWW7rKvk3Y5oxHUskLvczRRvG411W7cOhLFTJfUS3xjjm42wgWz2kaGVU70HJNw0NKEbrZwdzmQFnuWQJdz02de5q6UAT4ZxNyXklc9Zvz1hQ87UWozpwkwc3FrFirSA_SgPGDHqHTnXksyPgbsht-oLioL9oG7lxOsP8PRCk0jUwiRH0XEhWTlvyZfSPg58POfE7jB9fFIGlPMSj4pg`
        },
        body: JSON.stringify({
          config: JSON.stringify({
            sourceType: 'RDBMS_QUERY_SERVICE',
            source: {
              type: selectedSourceName,
              profileId: null,
              connectionInfo: {
                existingConnection: false,
                connectionJDBCURL: 'jdbc:sqlserver://10.10.20.203:1433',
                username: 'rd_db_load',
                password: 'J93EmKePkG/M9kzQTUxqcg==',
                className: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                schema: parentSchema, // Use the parent schema name
                catalog: parentCatalog, // Use the parent database name
              },
              sourceInfo: {
                id: "1",
                sourceTableOrQuery: nodeId.split('-').slice(-1)[0], // Extract table name
                blendColumns: null,
                driverTable: false,
              },
              datasetJoins: null,
              purpose: 'columnsList',
              previewCount: 100,
            },
          }),
          variables: '',
        }),
      });

      const data = await response.json();

      if (data.columns) {
        return data.columns.map((column) => ({
          id: `${nodeId}-${column.name}`,
          name: column.name,
          type: 'column',
          parent: nodeId,
          additionalInfo: {
            systemDataType: column.systemDataType,
            length: column.length,
            precision: column.precision,
            nullable: column.nullable,
            primaryKey: column.primaryKey,
            foreignKey: column.foreignKey,
          },
        }));
      }

      return []; // Return an empty array if no columns are found
    } catch (error) {
      console.error('Failed to fetch columns:', error);
      return [];
    }
  }

  return [];
};

const TreeNode = ({ node, level = 0, parentPath = '', onDragStart, selectedSourceName, parentCatalog = null, parentSchema = null }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState(null);
  const fullPath = `${parentPath ? `${parentPath}.` : ''}${node.name}`;

  const handleToggle = async () => {
    setOpen((prevOpen) => !prevOpen);
    if (!children && !loading) {
      setLoading(true);
      try {
        const fetchedChildren = await fetchChildNodes(
          node.id,
          node.type,
          selectedSourceName,
          node.type === 'schema' ? parentCatalog : parentCatalog,
          node.type === 'table' ? parentSchema : null
        );
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
        <ListItemIcon>
          {node.type === 'catalog' ? <StorageIcon /> : 
           node.type === 'schema' ? <FolderIcon /> : 
           node.type === 'table' ? <TableChartIcon /> : 
           <ViewColumnIcon />} {/* Database, Schema, Table, or Column Icon */}
        </ListItemIcon>
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
                selectedSourceName={selectedSourceName}
                parentCatalog={node.type === 'catalog' ? node.name : parentCatalog} // Pass catalog name if node is a catalog
                parentSchema={node.type === 'schema' ? node.name : parentSchema} // Pass schema name if node is a schema
              />
            ))}
        </List>
      </Collapse>
    </div>
  );
};



const DatabaseTree = ({ data, onDragStart, selectedSourceName }) => {
  return (
    <List>
      {data.map((db) => (
        <TreeNode
          key={db.CATALOG_NAME}
          node={{ id: db.CATALOG_NAME, name: db.CATALOG_NAME, type: 'catalog' }}
          onDragStart={onDragStart}
          selectedSourceName={selectedSourceName}
        />
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

// New function to execute the query and fetch results
const executeQuery = async (queryText) => {
  try {
    const response = await fetch('https://dx-qast.getrightdata.com/dbexplorer/services/run-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSQkZRb3QzQndkeW03dFJfWlk4U3RtR1RYUHRrV3N6Sk05Y1djamJOV3AwIn0.eyJleHAiOjE3MzAyMTQwMjMsImlhdCI6MTczMDEyNzYyMywiYXV0aF90aW1lIjoxNzMwMTI3NjIxLCJqdGkiOiIyMjE5MTE5Zi0wMDE2LTRjMTUtYmUxMC0wNzc4MDJmNDI2MjQiLCJpc3MiOiJodHRwczovL2R4LXFhc3QuZ2V0cmlnaHRkYXRhLmNvbTo5NDQzL3JlYWxtcy9kZXh0cnVzIiwiYXVkIjoiZGF0YS1tYXJrZXQiLCJzdWIiOiI1NDUwMDg3Ny1jMDc5LTQwYjctOWRhNC1mNGM0ODFjNDk4MmQiLCJ0eXAiOiJJRCIsImF6cCI6ImRhdGEtbWFya2V0Iiwibm9uY2UiOiI4ZDY0N2FiMi1mYjQyLTQ5ZmYtYjhlMy0wMjIxZWJmNTdkOGEiLCJzZXNzaW9uX3N0YXRlIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiYXRfaGFzaCI6IkVsQ2sxSWlzUlRkSi02cFZ5cUt1Z3ciLCJhY3IiOiIxIiwic2lkIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiaXNEZlVzZXIiOnRydWUsImlzQ29uc3VtZXIiOnRydWUsInN1YiI6IkRYQURNSU46MSIsImNsaWVudElkIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3NSb2xlcyI6WyJncy5keGFkbWluLXJvbGUiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJvbmx5RGF0YU1hcmtldEFsbG93ZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImdpdmVuX25hbWUiOiJEYXZpZCIsInVzZXJOYW1lIjoiRGF2aWQiLCJ1c2VySWQiOiIxIiwidXVpZCI6IjU0NTAwODc3LWMwNzktNDBiNy05ZGE0LWY0YzQ4MWM0OTgyZCIsIm5hbWUiOiJEYXZpZCBhZG1pbiIsInVzZXJFbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImJ1c2luZXNzT3duZXIiOnRydWUsImZhbWlseV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSJ9.TopTeVYJZUwbi-uMwL6JPAp-hwivY6rKmTzOA5DObdWmihQZwhgshQQU_-Qv-788G5TXpMJ0WCBku3UUq85Lszsuo-9YufQEH44FYZaIsRga-wZHHLseixRL-mOkM14q-RrWW7rKvk3Y5oxHUskLvczRRvG411W7cOhLFTJfUS3xjjm42wgWz2kaGVU70HJNw0NKEbrZwdzmQFnuWQJdz02de5q6UAT4ZxNyXklc9Zvz1hQ87UWozpwkwc3FrFirSA_SgPGDHqHTnXksyPgbsht-oLioL9oG7lxOsP8PRCk0jUwiRH0XEhWTlvyZfSPg58POfE7jB9fFIGlPMSj4pg`
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

const StepQuery = ({ selectedSource }) => {
  const [tabs, setTabs] = useState([{ id: 0, title: 'Query 1', content: '' }]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [nextTabId, setNextTabId] = useState(1);
  const [databaseTreeData, setDatabaseTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gridData, setGridData] = useState(null); // New state for grid data

  useEffect(() => {
    if (selectedSource?.name) {
      fetchDatabaseTree(selectedSource.name);
    }
  }, [selectedSource]);

  const fetchDatabaseTree = async (sourceType) => {
    setLoading(true);
    try {
      const response = await fetch('https://dx-qast.getrightdata.com/dweb/queryasservice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJSQkZRb3QzQndkeW03dFJfWlk4U3RtR1RYUHRrV3N6Sk05Y1djamJOV3AwIn0.eyJleHAiOjE3MzAyMTQwMjMsImlhdCI6MTczMDEyNzYyMywiYXV0aF90aW1lIjoxNzMwMTI3NjIxLCJqdGkiOiIyMjE5MTE5Zi0wMDE2LTRjMTUtYmUxMC0wNzc4MDJmNDI2MjQiLCJpc3MiOiJodHRwczovL2R4LXFhc3QuZ2V0cmlnaHRkYXRhLmNvbTo5NDQzL3JlYWxtcy9kZXh0cnVzIiwiYXVkIjoiZGF0YS1tYXJrZXQiLCJzdWIiOiI1NDUwMDg3Ny1jMDc5LTQwYjctOWRhNC1mNGM0ODFjNDk4MmQiLCJ0eXAiOiJJRCIsImF6cCI6ImRhdGEtbWFya2V0Iiwibm9uY2UiOiI4ZDY0N2FiMi1mYjQyLTQ5ZmYtYjhlMy0wMjIxZWJmNTdkOGEiLCJzZXNzaW9uX3N0YXRlIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiYXRfaGFzaCI6IkVsQ2sxSWlzUlRkSi02cFZ5cUt1Z3ciLCJhY3IiOiIxIiwic2lkIjoiODgwZjJkNGMtM2NjMy00NTdiLWExMmUtY2EyMTc0ZTE5ZDUwIiwiaXNEZlVzZXIiOnRydWUsImlzQ29uc3VtZXIiOnRydWUsInN1YiI6IkRYQURNSU46MSIsImNsaWVudElkIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3NSb2xlcyI6WyJncy5keGFkbWluLXJvbGUiXSwiaXNTdXBlckFkbWluIjp0cnVlLCJvbmx5RGF0YU1hcmtldEFsbG93ZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImdpdmVuX25hbWUiOiJEYXZpZCIsInVzZXJOYW1lIjoiRGF2aWQiLCJ1c2VySWQiOiIxIiwidXVpZCI6IjU0NTAwODc3LWMwNzktNDBiNy05ZGE0LWY0YzQ4MWM0OTgyZCIsIm5hbWUiOiJEYXZpZCBhZG1pbiIsInVzZXJFbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSIsImJ1c2luZXNzT3duZXIiOnRydWUsImZhbWlseV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImR4YWRtaW5AZ2V0cmlnaHRkYXRhLmNvbSJ9.TopTeVYJZUwbi-uMwL6JPAp-hwivY6rKmTzOA5DObdWmihQZwhgshQQU_-Qv-788G5TXpMJ0WCBku3UUq85Lszsuo-9YufQEH44FYZaIsRga-wZHHLseixRL-mOkM14q-RrWW7rKvk3Y5oxHUskLvczRRvG411W7cOhLFTJfUS3xjjm42wgWz2kaGVU70HJNw0NKEbrZwdzmQFnuWQJdz02de5q6UAT4ZxNyXklc9Zvz1hQ87UWozpwkwc3FrFirSA_SgPGDHqHTnXksyPgbsht-oLioL9oG7lxOsP8PRCk0jUwiRH0XEhWTlvyZfSPg58POfE7jB9fFIGlPMSj4pg`
        },
        body: JSON.stringify({
          config: JSON.stringify({
            sourceType: 'RDBMS_QUERY_SERVICE',
            source: {
              type: sourceType,
              profileId: null,
              connectionInfo: {
                existingConnection: false,
                connectionJDBCURL: 'jdbc:sqlserver://10.10.20.203:1433',
                username: 'rd_db_load',
                password: 'J93EmKePkG/M9kzQTUxqcg==',
                className: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                schema: null,
                catalog: null,
              },
              sourceInfo: {},
              datasetJoins: null,
              purpose: 'catalogList',
              previewCount: 100,
            },
          }),
          variables: '',
        }),
      });

      const data = await response.json();
      setDatabaseTreeData(data.catalogs || []); // Set catalogs as the initial data
    } catch (error) {
      console.error('Failed to fetch database tree:', error);
    } finally {
      setLoading(false);
    }
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
      <FlexiSplit element1Id="panel1" element2Id="panel2" options={splitOptions}>
        <div style={{height: '100%',overflowY:'hidden'}}>
        <FlexiSplit element1Id="paneli1" element2Id="paneli2" options={splitOptionsi}>
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
                <IconButton onClick={handlePrettyPrintQuery}><FormatAlignLeftIcon /></IconButton>
                <IconButton onClick={handleCopyQuery}><ContentCopyIcon /></IconButton>
                <IconButton onClick={handleClearEditor}><ClearIcon /></IconButton>
                <IconButton onClick={handleExportQuery}><FileDownloadIcon /></IconButton>
                <IconButton onClick={handleRunQuery}><PlayArrowIcon /></IconButton>
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
          <div className="ag-theme-alpine" style={{ height:'100%', width: '100%' }}>
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
          {loading ? (
            <CircularProgress />
          ) : (
            <DatabaseTree 
              data={databaseTreeData} 
              onDragStart={(e, tablePath) => e.dataTransfer.setData('text/plain', tablePath)} 
              selectedSourceName={selectedSource.name}
            />
          )}
        </div>
      </FlexiSplit>
    </div>
  );
};

export default StepQuery;
