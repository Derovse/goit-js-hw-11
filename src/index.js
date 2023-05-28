import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.photo-card a');

let searchQuery = '';
let page = 1;
let isLoading = false;

function searchImages(query, pageNumber) {
  const apiKey = '36819208-118ee9ee8a017b968566d5809'; // Замените на свой уникальный ключ API
  const perPage = 40;

  axios
    .get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pageNumber,
        per_page: perPage,
      },
    })
    .then(response => {
      const images = response.data.hits;
      const totalHits = response.data.totalHits;

      if (images.length === 0) {
        if (pageNumber === 1) {
          hideLoadMoreBtn();
          showNotification(
            'Sorry, there are no images matching your search query. Please try again.',
            'failure'
          );
        } else {
          showNotification(
            "We're sorry, but you've reached the end of search results.",
            'warning'
          );
        }
      } else {
        const galleryMarkup = createGalleryMarkup(images);
        gallery.insertAdjacentHTML('beforeend', galleryMarkup);
        lightbox.refresh();
        page++;
        isLoading = false;

        if (page === 2) {
          showNotification(`Hooray! We found ${totalHits} images.`);
        }
      }
    })
    .catch(error => {
      console.error(error);
      showNotification(
        'Oops! Something went wrong. Please try again later.',
        'failure'
      );
      isLoading = false;
    });
}

function createGalleryMarkup(images) {
  return images
    .map(
      image => `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `
    )
    .join('');
}

function showNotification(message, type = 'success') {
  Notiflix.Notify[type.toLowerCase()](message, {
    position: 'right-top',
    timeout: 3000,
  });
}

function hideLoadMoreBtn() {
  loadMoreBtn.classList.add('hidden');
}

function handleFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    showNotification('Please enter a search keyword.', 'warning');
    return;
  }

  gallery.innerHTML = '';
  page = 1;
  isLoading = true;
  searchImages(searchQuery, page);
  loadMoreBtn.classList.remove('hidden');
}

function handleLoadMoreBtnClick() {
  if (!isLoading) {
    isLoading = true;
    searchImages(searchQuery, page);
  }
}

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreBtnClick);
