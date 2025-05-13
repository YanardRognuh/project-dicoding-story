// pages/home/home-page.js
import StoryModel from "../../data/models/story-model.js";
import { showFormattedDate } from "../../utils/index.js";
import Map from "../../utils/map.js";
import HomePresenter from "../../presenters/home-presenter.js";

export default class HomePage {
  #storyModel;
  #map;
  #presenter;

  constructor() {
    this.#storyModel = new StoryModel();
    this.#map = null;
    this.#presenter = new HomePresenter({
      model: this.#storyModel,
      view: this,
    });
  }

  async render() {
    return `
      <section class="container">
        <h1>Cerita Dicoding</h1>
        
        <div id="mapContainer" class="map-container">
          <div id="mapLoading" class="loading-indicator map-loading">
            <p>Memuat peta...</p>
          </div>
          <div id="storyMap" class="story-map"></div>
        </div>
        
        <div id="loading" class="loading-indicator">
          <p>Memuat cerita...</p>
        </div>
        
        <div id="storyList" class="story-list"></div>
        
        <a href="#/add" class="add-button" aria-label="Tambah cerita baru">+</a>
      </section>
    `;
  }

  async afterRender() {
    await this.#presenter.showStories();
  }

  async initializeMap() {
    try {
      this.#map = await Map.build("#storyMap", {
        zoom: 5,
        locate: true,
      });
    } catch (error) {
      throw error;
    } finally {
      this.hideMapLoading();
    }
  }

  addMapMarker(coordinate, markerOptions, popupOptions) {
    if (this.#map) {
      return this.#map.addMarker(coordinate, markerOptions, popupOptions);
    }
    return null;
  }

  showStories(stories) {
    const storyListElement = document.getElementById("storyList");
    storyListElement.innerHTML = "";

    stories.forEach((story) => {
      storyListElement.innerHTML += this.#createStoryItemTemplate(story);
    });
  }

  // Method baru untuk menampilkan stories di peta (dipindahkan dari presenter)
  async showStoriesOnMap(stories) {
    try {
      await this.initializeMap();

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const coordinate = [story.lat, story.lon];
          const markerOptions = { alt: story.name };
          const popupOptions = {
            content: this.#createMapPopupTemplate(story),
          };

          this.addMapMarker(coordinate, markerOptions, popupOptions);
        }
      });
    } catch (error) {
      this.showMapError(error.message);
    } finally {
      this.hideMapLoading();
    }
  }

  showEmpty() {
    const storyListElement = document.getElementById("storyList");
    storyListElement.innerHTML = `
      <div class="empty-message">Belum ada cerita yang ditambahkan.</div>
    `;
  }

  showLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "block";
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }
  }

  showMapLoading() {
    const mapLoadingElement = document.getElementById("mapLoading");
    if (mapLoadingElement) {
      mapLoadingElement.style.display = "block";
    }
  }

  hideMapLoading() {
    const mapLoadingElement = document.getElementById("mapLoading");
    if (mapLoadingElement) {
      mapLoadingElement.style.display = "none";
    }
  }

  showError(message) {
    const storyListElement = document.getElementById("storyList");
    storyListElement.innerHTML = `
      <div class="error-message">${
        message || "Terjadi kesalahan saat memuat cerita"
      }</div>
    `;
  }

  showMapError(message) {
    document.getElementById("mapContainer").innerHTML = `
      <div class="error-message">Tidak dapat memuat peta: ${message}</div>
    `;
  }

  // Template untuk item cerita
  #createStoryItemTemplate(story) {
    let locationInfo = "";

    if (story.lat && story.lon) {
      const locationDisplay = story.placeName || `${story.lat}, ${story.lon}`;
      locationInfo = `
        <p class="story-location">
          <i class="fas fa-map-marker-alt"></i> ${locationDisplay}
        </p>
      `;
    }

    return `
      <article class="story-item">
        <img 
          src="${story.photoUrl}" 
          alt="Foto dari ${story.name}" 
          class="story-image" 
          loading="lazy"
        >
        <div class="story-content">
          <h2 class="story-name">${story.name}</h2>
          <p class="story-description">${story.description}</p>
          <p class="story-date">${showFormattedDate(story.createdAt)}</p>
          ${locationInfo}
          <a href="#/story/${story.id}" class="story-link">Lihat Detail</a>
        </div>
      </article>
    `;
  }

  // Template baru untuk popup peta (dipindahkan dari presenter)
  #createMapPopupTemplate(story) {
    return `
      <div class="map-popup">
        <h3>${story.name}</h3>
        <a href="#/story/${story.id}">Lihat Detail</a>
      </div>
    `;
  }
}
