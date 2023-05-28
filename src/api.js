import axios from 'axios';

const apiKey = '36819208-118ee9ee8a017b968566d5809'; // Замените на свой уникальный ключ API

export async function searchImages(query, pageNumber, perPage) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pageNumber,
        per_page: perPage,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error('Oops! Something went wrong. Please try again later.');
  }
}
