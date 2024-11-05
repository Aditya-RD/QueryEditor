// DatabaseTree.js
import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  CircularProgress,
  IconButton,
  ListItemIcon,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import StorageIcon from '@mui/icons-material/Storage';
// import FolderIcon from '@mui/icons-material/Folder';
// import TableChartIcon from '@mui/icons-material/TableChart';
// import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import StorageIcon from './assets/images/database.svg'; // Database icon
import FolderIcon from './assets/images/schema.svg'; // Schema icon
import TableChartIcon from './assets/images/table.svg'; // Table icon
import ViewColumnIcon from './assets/images/dbcolumn.png'; // Column icon
import { queryAsService } from './services/queryAsService'

const fetchChildNodes = async (nodeId, nodeType, selectedSourceName, parentCatalog = null, parentSchema = null) => {
  if (nodeType === 'catalog') { // Fetch schemas when expanding a catalog
    try {
      
      const data = await queryAsService({
        selectedsource: selectedSourceName,
        catalog: nodeId,
        purpose: 'schemaList'
      });

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
      
      const data = await queryAsService({
        selectedsource: selectedSourceName,
        schema: nodeId.split('-')[1],
        catalog: parentCatalog,
        purpose: 'tablesList',
        objecttype: 'TABLE'
      });

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
      
      const data = await queryAsService({
        selectedsource: selectedSourceName,
        schema: parentSchema,
        catalog: parentCatalog,
        purpose: 'columnsList',
        sourceinfo: {
          id: "1",
          sourceTableOrQuery: nodeId.split('-').slice(-1)[0], // Extract table name
          blendColumns: null,
          driverTable: false,
        }
      });

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
        <ListItemIcon sx={{ minWidth: '36px' }}>
          {node.type === 'catalog' ? <img src={StorageIcon} alt="StorageIcon" style={{ height: '15px' }} /> :
            node.type === 'schema' ? <img src={FolderIcon} alt="FolderIcon" style={{ height: '15px' }} /> :
              node.type === 'table' ? <img src={TableChartIcon} alt="TableChartIcon" style={{ height: '15px' }} /> :
                <img src={ViewColumnIcon} alt="ViewColumnIcon" style={{ height: '15px' }} />} {/* Database, Schema, Table, or Column Icon */}
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
          {children && children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              parentPath={fullPath}
              onDragStart={onDragStart}
              selectedSourceName={selectedSourceName}
              parentCatalog={node.type === 'catalog' ? node.name : parentCatalog}
              parentSchema={node.type === 'schema' ? node.name : parentSchema}
            />
          ))}
        </List>
      </Collapse>
    </div>
  );
};

const DatabaseTree = ({ selectedSourceName, onDragStart }) => {
  const [databaseTreeData, setDatabaseTreeData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSourceName) {
      fetchDatabaseTree(selectedSourceName);
    }
  }, [selectedSourceName]);

  const fetchDatabaseTree = async (sourceType) => {
    setLoading(true);
    try {
      
      const data = await queryAsService({
        selectedsource: sourceType,
        purpose: 'catalogList'
      });
      setDatabaseTreeData(data.catalogs || []);
    } catch (error) {
      console.error('Failed to fetch database tree:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: 'calc(100% - 55px)', overflowY: 'auto' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {databaseTreeData.map((db) => (
            <TreeNode
              key={db.CATALOG_NAME}
              node={{ id: db.CATALOG_NAME, name: db.CATALOG_NAME, type: 'catalog' }}
              onDragStart={onDragStart}
              selectedSourceName={selectedSourceName}
            />
          ))}
        </List>
      )}
    </div>
  );
};

export default DatabaseTree;
