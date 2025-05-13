// presenters/add-story-presenter.js
export default class AddStoryPresenter {
  #model;
  #view;
  #photoFile;
  #latitude;
  #longitude;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#photoFile = null;
    this.#latitude = null;
    this.#longitude = null;
  }

  async initCamera() {
    try {
      await this.#view.setupCamera();
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  async initMap() {
    try {
      await this.#view.initializeMap();

      // Get the center coordinates of the map
      const center = await this.#view.getMapCenter();

      // Set initial coordinates
      this.#latitude = center.latitude;
      this.#longitude = center.longitude;

      // Update UI with coordinates
      this.#view.updateCoordinateDisplay(this.#latitude, this.#longitude);

      // Add a marker
      await this.#view.addMarkerAtCoordinates(this.#latitude, this.#longitude);
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  setLocationCoordinates(lat, lng) {
    this.#latitude = lat;
    this.#longitude = lng;
    this.#view.updateCoordinateDisplay(lat, lng);
  }

  setPhoto(photoFile) {
    this.#photoFile = photoFile;
    this.#view.showPhotoPreview(photoFile);
  }

  async submitStory(description) {
    try {
      this.#view.showSubmitLoading();

      if (!this.#photoFile) {
        this.#view.showError("Silakan pilih foto untuk cerita Anda");
        return;
      }

      const response = await this.#model.addStory({
        description,
        photo: this.#photoFile,
        lat: this.#latitude,
        lon: this.#longitude,
      });

      if (response.error) {
        this.#view.showError(response.message);
      } else {
        this.#view.navigateToHome();
      }
    } catch (error) {
      this.#view.showError("Terjadi kesalahan saat mengirim cerita");
    } finally {
      this.#view.hideSubmitLoading();
    }
  }

  resetState() {
    this.#photoFile = null;
    this.#latitude = null;
    this.#longitude = null;
  }
}
