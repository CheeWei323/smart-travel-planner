import axios from 'axios';

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY; 
const BASE_URL = 'https://api.pexels.com/v1/search';

export const getImageForDestination = async (destination) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query: destination,
        per_page: 1, 
      },
    });

    const imageUrl = response.data.photos[0]?.src?.original;
    if (imageUrl) {
      return imageUrl;
    } else {
      throw new Error('No image found');
    }
  } catch (error) {
    console.error(`Failed to fetch image for ${destination}:`, error);
    return 'https://images.unsplash.com/photo-1506929562872-bb421503ef21';
  }
};