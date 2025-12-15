import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const spotifyService = {
    login: () => {
        window.location.href = `${API_BASE_URL}/login`;
    },

    getCurrentUser: async (accessToken) => {
        const response = await axios.get(`${API_BASE_URL}/user`,
             {
                headers: {Authorization: `Bearer ${accessToken}`}
             });
        return response.data;



    },

    searchTracks: async (accessToken, query) => {
        const response = await axios.get(`${API_BASE_URL}/search`, {

            params: { q: query },
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    }
};