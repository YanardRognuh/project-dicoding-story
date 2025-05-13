// pages/story/add-story-page.js
import StoryModel from "../../data/models/story-model.js";
import Camera from "../../utils/camera.js";
import Map from "../../utils/map.js";
import AddStoryPresenter from "../../presenters/add-story-presenter.js";

class AddStoryPage {
  #storyModel;
  #camera;
  #map;
  #locationMarker;
  #isCameraOpen;
  #isInitialized;
  #presenter;

  constructor() {
    this.#storyModel = new StoryModel();
    this.#camera = null;
    this.#map = null;
    this.#locationMarker = null;
    this.#isCameraOpen = false;
    this.#isInitialized = false;

    this.#presenter = new AddStoryPresenter({
      model: this.#storyModel,
      view: this,
    });
  }

  async render() {
    this.#cleanupResources();
    this.#presenter.resetState();

    return `
      <section class="container">
        <h1>Tambah Cerita Baru</h1>
        
        <form id="addStoryForm" class="auth-form story-form">
          <div id="alertContainer"></div>
          
          <div class="form-group">
            <label for="description">Cerita</label>
            <textarea id="description" name="description" class="form-control" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="photo">Foto</label>
            <div class="photo-controls">
              <input type="file" id="photo" name="photo" class="form-control" accept="image/*">
              <button type="button" id="openCameraButton" class="form-button">Buka Kamera</button>
            </div>
            
            <div id="cameraContainer" class="camera-container" style="display: none;">
              <video id="cameraVideo" class="camera-video">
                Video stream not available.
              </video>
              <canvas id="cameraCanvas" class="camera-canvas" style="display: none;"></canvas>
              
              <div class="camera-tools">
                <select id="cameraSelect" class="form-control"></select>
                <button type="button" id="captureButton" class="form-button">Ambil Gambar</button>
              </div>
            </div>
            
            <div id="photoPreview" class="photo-preview"></div>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" id="shareLocation"> Bagikan lokasi saya
            </label>
            <div id="locationInfo" class="location-info" style="display: none;">
              <p>Latitude: <span id="latitudeValue">-</span></p>
              <p>Longitude: <span id="longitudeValue">-</span></p>
            </div>
            
            <div id="mapContainer" class="map-container" style="display: none;">
              <div id="map" style="width: 100%; height: 300px;"></div>
              <p class="map-instruction">Klik pada peta untuk memilih lokasi atau geser marker</p>
            </div>
          </div>
          
          <button type="submit" class="form-button">Kirim Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    if (this.#isInitialized) {
      return;
    }

    this.#isInitialized = true;
    this.#setupEventListeners();
  }

  #setupEventListeners() {
    const addStoryForm = document.getElementById("addStoryForm");
    const photoInput = document.getElementById("photo");
    const openCameraButton = document.getElementById("openCameraButton");
    const shareLocationCheckbox = document.getElementById("shareLocation");
    const locationInfo = document.getElementById("locationInfo");
    const mapContainer = document.getElementById("mapContainer");
    const cameraContainer = document.getElementById("cameraContainer");
    const captureButton = document.getElementById("captureButton");

    // Handle photo from file input
    photoInput.addEventListener("change", (event) => {
      if (event.target.files.length > 0) {
        this.#presenter.setPhoto(event.target.files[0]);
      }
    });

    // Setup camera toggling
    openCameraButton.addEventListener("click", async () => {
      this.#isCameraOpen = !this.#isCameraOpen;
      cameraContainer.style.display = this.#isCameraOpen ? "block" : "none";

      if (this.#isCameraOpen) {
        openCameraButton.textContent = "Tutup Kamera";
        await this.#presenter.prepareCamera();
      } else {
        openCameraButton.textContent = "Buka Kamera";
        this.stopCamera();
      }
    });

    // Setup capture button
    captureButton.addEventListener("click", async () => {
      if (this.#camera) {
        const imageBlob = await this.#camera.takePicture();
        if (imageBlob) {
          this.#presenter.setPhoto(imageBlob);
        }
      }
    });

    // Handle location sharing
    shareLocationCheckbox.addEventListener("change", async (event) => {
      if (event.target.checked) {
        locationInfo.style.display = "block";
        mapContainer.style.display = "block";
        await this.#presenter.prepareMap();
      } else {
        locationInfo.style.display = "none";
        mapContainer.style.display = "none";
        this.#presenter.setLocationCoordinates(null, null);
      }
    });

    // Setup map click event
    document.addEventListener("mapInitialized", () => {
      if (this.#map && this.#locationMarker) {
        // Dibuat hanya untuk didaftarkan setelah map terinisialisasi
        this.#map.addMapEventListener("click", (event) => {
          const { lat, lng } = event.latlng;
          this.#locationMarker.setLatLng([lat, lng]);
          this.#presenter.setLocationCoordinates(lat, lng);
        });

        // Setup marker drag event
        this.#locationMarker.on("dragend", (event) => {
          const position = event.target.getLatLng();
          this.#presenter.setLocationCoordinates(position.lat, position.lng);
        });
      }
    });

    // Handle form submission
    addStoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const description = document.getElementById("description").value;
      await this.#presenter.submitStory(description);
    });
  }

  async setupCamera() {
    try {
      const cameraVideo = document.getElementById("cameraVideo");
      const cameraCanvas = document.getElementById("cameraCanvas");
      const cameraSelect = document.getElementById("cameraSelect");

      // Clean up any existing camera
      if (this.#camera) {
        this.#camera.stop();
        this.#camera = null;
      }

      // Create camera instance
      this.#camera = new Camera({
        video: cameraVideo,
        cameraSelect: cameraSelect,
        canvas: cameraCanvas,
      });

      // Launch camera
      await this.#camera.launch();
    } catch (error) {
      throw error;
    }
  }

  stopCamera() {
    if (this.#camera) {
      this.#camera.stop();
    }
  }

  async initializeMap() {
    try {
      // Clean up any existing map
      if (this.#map) {
        if (typeof this.#map.remove === "function") {
          this.#map.remove();
        }
        this.#map = null;
      }

      // Make sure the map container exists
      const mapContainer = document.getElementById("map");
      if (!mapContainer) {
        throw new Error("Map container not found");
      }

      // Initialize the map with user's location if allowed
      this.#map = await Map.build("#map", {
        zoom: 15,
        locate: true,
      });

      // Get map center
      const center = await this.getMapCenter();

      // Add a draggable marker at the coordinates
      const markerCoordinates = [center.latitude, center.longitude];
      this.#locationMarker = this.#map.addMarker(markerCoordinates, {
        draggable: true,
      });

      // Dispatch event that map is initialized
      const mapInitEvent = new Event("mapInitialized");
      document.dispatchEvent(mapInitEvent);

      return center;
    } catch (error) {
      throw error;
    }
  }

  async getMapCenter() {
    if (!this.#map) {
      return { latitude: -6.2, longitude: 106.816666 }; // Default to Jakarta
    }

    const center = this.#map.getCenter ? this.#map.getCenter() : null;
    return center || { latitude: -6.2, longitude: 106.816666 };
  }

  updateCoordinateDisplay(lat, lng) {
    document.getElementById("latitudeValue").textContent = lat || "-";
    document.getElementById("longitudeValue").textContent = lng || "-";
  }

  showPhotoPreview(photoFile) {
    const photoPreview = document.getElementById("photoPreview");
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        photoPreview.innerHTML = `
          <img src="${event.target.result}" alt="Preview foto" style="max-width: 100%; max-height: 300px;">
        `;
      };
      reader.readAsDataURL(photoFile);
    }
  }

  showError(message) {
    const alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = `
      <div class="alert alert-error">${message}</div>
    `;
  }

  showSubmitLoading() {
    const submitButton = document.querySelector(
      "#addStoryForm button[type='submit']"
    );
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Mengirim...";
    }
  }

  hideSubmitLoading() {
    const submitButton = document.querySelector(
      "#addStoryForm button[type='submit']"
    );
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Kirim Cerita";
    }
  }

  navigateToHome() {
    this.#cleanupResources();
    window.location.hash = "#/";
  }

  #cleanupResources() {
    // Properly clean up camera if it exists
    if (this.#camera) {
      this.#camera.stop();
      this.#camera = null;
    }

    // Properly clean up map if it exists
    if (this.#map) {
      if (typeof this.#map.remove === "function") {
        this.#map.remove();
      }
      this.#map = null;
      this.#locationMarker = null;
    }

    this.#isCameraOpen = false;
  }
}

export default AddStoryPage;
