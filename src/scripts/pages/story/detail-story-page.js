// pages/detail-story-page.js
import StoryModel from "../../data/models/story-model";
import { parseActivePathname } from "../../routes/url-parser";
import { showFormattedDate } from "../../utils";
import Map from "../../utils/map";
import StoryPresenter from "../../presenters/detail-story-presenter";

class DetailStoryPage {
  constructor() {
    this._storyModel = new StoryModel();
    this._story = null;
    this._map = null;
    this._presenter = null;
  }

  async render() {
    return `
      <section class="container">
        <div id="loading" class="loading-indicator">
          <p>Memuat cerita...</p>
        </div>
        
        <div id="storyDetail" class="story-detail"></div>
      </section>
    `;
  }

  async afterRender() {
    const url = parseActivePathname();
    const id = url.id;

    if (!id) {
      window.location.hash = "#/404";
      return;
    }

    this._presenter = new StoryPresenter(id, {
      view: this,
      storyModel: this._storyModel,
    });

    await this._presenter.showStoryDetail();
  }

  async initialMap() {
    this._map = await Map.build("#storyMap", {
      zoom: 15,
    });
  }

  async getPlaceNameByCoordinate(latitude, longitude) {
    return await Map.getPlaceNameByCoordinate(latitude, longitude);
  }

  addMapMarker(coordinate, markerOptions, popupOptions) {
    if (this._map) {
      return this._map.addMarker(coordinate, markerOptions, popupOptions);
    }
    return null;
  }

  changeMapCamera(coordinate, zoomLevel) {
    if (this._map) {
      this._map.changeCamera(coordinate, zoomLevel);
    }
  }

  async populateStoryDetail(story) {
    this._story = story;

    // Mencoba mendapatkan nama tempat jika ada koordinat
    if (story.lat && story.lon) {
      try {
        story.placeName = await this.getPlaceNameByCoordinate(
          story.lat,
          story.lon
        );
      } catch (error) {
        console.error("Error getting place name:", error);
        story.placeName = `${story.lat}, ${story.lon}`;
      }
    }

    const storyDetailElement = document.getElementById("storyDetail");
    storyDetailElement.innerHTML = this._createStoryDetailTemplate(story);
  }

  async displayStoryMap(story) {
    // Pastikan elemen map sudah ada di DOM
    // Karena elemen map dibuat dalam populateStoryDetail,
    // kita perlu sedikit delay untuk memastikan DOM sudah terupdate
    setTimeout(async () => {
      const mapElement = document.getElementById("storyMap");
      if (!mapElement) {
        console.error("Map container not found");
        return;
      }

      this.showMapLoading();
      try {
        await this.initialMap();

        if (story.lat && story.lon) {
          const coordinate = [story.lat, story.lon];
          const markerOptions = { alt: story.name };
          const popupOptions = {
            content: this._createMapPopupContent(story),
          };

          this.addMapMarker(coordinate, markerOptions, popupOptions);
          this.changeMapCamera(coordinate, 15);
        }
      } catch (error) {
        console.error("displayStoryMap: error:", error);
        this.showMapError(error.message);
      } finally {
        this.hideMapLoading();
      }
    }, 100); // Delay kecil untuk memastikan DOM telah terupdate
  }

  _createMapPopupContent(story) {
    return story.name;
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
    const storyDetailElement = document.getElementById("storyDetail");
    storyDetailElement.innerHTML = `
      <div class="error-message">${
        message || "Terjadi kesalahan saat memuat detail cerita"
      }</div>
    `;
  }

  showMapError(message) {
    const mapElement = document.getElementById("storyMap");
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="error-message">${
          message || "Terjadi kesalahan saat memuat peta"
        }</div>
      `;
    }
  }

  _createStoryDetailTemplate(story) {
    let mapSection = "";

    if (story.lat && story.lon) {
      const placeName = story.placeName || `${story.lat}, ${story.lon}`;

      mapSection = `
        <div class="story-map-container">
          <h3>Lokasi</h3>
          <p class="story-location">
            <i class="fas fa-map-marker-alt"></i> ${placeName}
          </p>
          <div id="mapLoading" class="loading-indicator map-loading">
            <p>Memuat peta...</p>
          </div>
          <div id="storyMap" class="story-map"></div>
        </div>
      `;
    }

    return `
      <div class="story-detail-content">
        <a href="#/" class="back-button">&larr; Kembali</a>
        <h1 class="story-detail-name">${story.name}</h1>
        <p class="story-detail-date">${showFormattedDate(story.createdAt)}</p>
        
        <img 
          src="${story.photoUrl}" 
          alt="Foto dari ${story.name}" 
          class="story-detail-image"
        >
        
        <p class="story-detail-description">${story.description}</p>
        
        ${mapSection}
      </div>
    `;
  }
}

export default DetailStoryPage;
