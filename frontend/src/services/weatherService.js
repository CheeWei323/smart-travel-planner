import axios from 'axios';

const API_KEY = '81152d634cd486e98d3258a8a04bf922'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherByCity = async (city) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',  // Celsius
      },
    });
    return response.data;
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
};