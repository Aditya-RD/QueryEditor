const API_URL = 'https://dx-qast.getrightdata.com/dbexplorer/services/run-query';
const BEARER_TOKEN = process.env.REACT_APP_BEARER_TOKEN;

export const executeQueryService = async ({ queryText = null }) => {
    try {
        const response = await fetch(
            API_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${BEARER_TOKEN}`
                },
                body: JSON.stringify({
                    sourceType: "RDBMS_QUERY_SERVICE",
                    source: {
                        type: "MSSQL",
                        profileId: null,
                        connectionInfo: {
                            catalog: null,
                            connectionId: 1,
                            existingConnection: true,
                            schema: null
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
            }
        );
        const result = await response.json();
        if (result) {
            return result;
        } else {
            throw new Error('Failed to retrieve data');
        }
    } catch (error) {
        console.error('Failed to retrieve data:', error);
        return null;
    }
};