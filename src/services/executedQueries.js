const API_HOST = 'http://localhost:4000/'

export const createWorksheetExecutedQuery = async (payload={}) => {
    try {
        const response = await fetch(
            API_HOST+`executed-queries`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );
        
        if (response.ok) {
            return 'ok';
        } else {
            throw new Error('Failed to retrieve data');
        }
    } catch (error) {
        console.error('Failed to retrieve data:', error);
        return null;
    }
};

export const getWorksheetExecutedQueries = async (worksheetId) => {
    try {
        const response = await fetch(
            API_HOST+`executed-queries/${worksheetId}`,
            {
                method: 'GET'
            }
        );
        if (!response.ok) throw new Error('Failed to fetch sources');
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

export const updateWorksheetExecutedQuery = async (QueryId=null,payload={}) => {
    try {
        const response = await fetch(
            API_HOST+`executed-queries/${QueryId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
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

export const deleteWorksheetExecutedQuery = async (QueryId) => {
    try {
        const response = await fetch(
            API_HOST+`executed-queries/${QueryId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
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