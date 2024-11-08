const API_URL = 'https://dx-uat.getrightdata.com/dweb/connections/jdbc/all';
const BEARER_TOKEN = process.env.REACT_APP_BEARER_TOKEN;

export const listOfProfiles = async () => {
    try {
        const response = await fetch(
            API_URL,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${BEARER_TOKEN}`
                }
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