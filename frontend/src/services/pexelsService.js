import axios from 'axios';


const PEXELS_API_KEY = 'idOMiqhVGjvFBjVcMx55ErXOEi71e45ZMM84MjL4IkQXyLmFj7ui4J5L'; 
const BASE_URL = 'https://api.pexels.com/v1/search';

/**
 * Fetch a single image URL for a given destination (city/country)
 * @param {string} destination - City or country name
 * @returns {Promise<string>} - Image URL or fallback image
 */
export const getImageForDestination = async (destination) => {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query: destination,
        per_page: 1, // only need one image
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
    // Fallback image (generic travel photo)
    return 'https://images.unsplash.com/photo-1506929562872-bb421503ef21';
  }
};