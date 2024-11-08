const API_HOST = 'http://localhost:4000/'

export const createWorksheet = async (payload = {}) => {
    try {
        const response = await fetch(
            API_HOST + `worksheets`,
            {
                method: 'POST',
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

export const getWorksheetsByWorkookId = async (workbookId) => {
    try {
        const response = await fetch(
            API_HOST + `worksheets/${workbookId}`,
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

export const updateWorksheet = async ( worksheetId = null, payload = {} ) => {
    try {
        const response = await fetch(
            API_HOST + `worksheets/${worksheetId}`,
            {
                method: 'PUT',
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

export const deleteWorksheet = async (worksheetId) => {
    try {
        const response = await fetch(
            API_HOST + `worksheets/${worksheetId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
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