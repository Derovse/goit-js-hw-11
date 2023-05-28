import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { searchImages } from './api';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.photo-card a');

let searchQuery = '';
let page = 1;
let isLoading = false;

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

function showLoadMoreBtn() {
  loadMoreBtn.classList.remove('hidden');
}

async function handleFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    showNotification('Please enter a search keyword.', 'warning');
    return;
  }

  gallery.innerHTML = '';
  page = 1;
  isLoading = true;

  try {
    const response = await searchImages(searchQuery, page, 40);
    const images = response.hits;
    const totalHits = response.totalHits;

    if (images.length === 0) {
      hideLoadMoreBtn();
      showNotification(
        'Sorry, there are no images matching your search query. Please try again.',
        'failure'
      );
    } else {
      const galleryMarkup = createGalleryMarkup(images);
      gallery.insertAdjacentHTML('beforeend', galleryMarkup);
      lightbox.refresh();
      page++;
      isLoading = false;

      if (page === 2) {
        showNotification(`Hooray! We found ${totalHits} images.`);
      }

      if (images.length < 40) {
        hideLoadMoreBtn();
        showNotification(
          "You've reached the end of search results.",
          'warning'
        );
      } else {
        showLoadMoreBtn();
      }
    }
  } catch (error) {
    console.error(error);
    showNotification(
      'Oops! Something went wrong. Please try again later.',
      'failure'
    );
    isLoading = false;
  }
}

async function handleLoadMoreBtn() {
  if (!isLoading) {
    isLoading = true;

    try {
      const response = await searchImages(searchQuery, page, 40);
      const images = response.hits;

      if (images.length === 0) {
        hideLoadMoreBtn();
        showNotification(
          "You've reached the end of search results.",
          'warning'
        );
      } else {
        const galleryMarkup = createGalleryMarkup(images);
        gallery.insertAdjacentHTML('beforeend', galleryMarkup);
        lightbox.refresh();
        page++;
        isLoading = false;

        if (images.length < 40) {
          hideLoadMoreBtn();
          showNotification(
            "You've reached the end of search results.",
            'warning'
          );
        } else {
          showLoadMoreBtn();
        }
      }
    } catch (error) {
      console.error(error);
      showNotification(
        'Oops! Something went wrong. Please try again later.',
        'failure'
      );
      isLoading = false;
    }
  }
}

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreBtn);
