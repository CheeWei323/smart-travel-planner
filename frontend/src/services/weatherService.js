import axios from 'axios';

console.log("My React App sees this key:", import.meta.env.VITE_WEATHER_API_KEY);

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; 
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