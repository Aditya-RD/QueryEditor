const API_URL = 'https://dx-uat.getrightdata.com/dweb/queryasservice';
const BEARER_TOKEN = process.env.REACT_APP_BEARER_TOKEN;

export const queryAsService = async ({selectedsource=null, schema=null, catalog=null, sourceinfo={}, purpose=null,objecttype=null}) => {
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
                    config: JSON.stringify({
                        sourceType: 'RDBMS_QUERY_SERVICE',
                        source: {
                            type: selectedsource,
                            profileId: null,
                            connectionInfo: {
                                existingConnection: false,
                                connectionJDBCURL: 'jdbc:sqlserver://10.10.20.203:1433',
                                username: 'rd_db_load',
                                password: 'J93EmKePkG/M9kzQTUxqcg==',
                                className: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
                                schema: schema,
                                catalog: catalog,
                            },
                            sourceInfo: sourceinfo,
                            datasetJoins: null,
                            purpose: purpose,
                            objectType: objecttype,
                            previewCount: 100,
                        },
                    }),
                    variables: '',
                }),
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