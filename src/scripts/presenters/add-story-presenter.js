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

  async prepareCamera() {
    try {
      await this.#view.setupCamera();
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  async prepareMap() {
    try {
      // Menunjukkan indikator loading jika diperlukan
      const mapCenter = await this.#view.initializeMap();

      // Set koordinat awal
      this.setLocationCoordinates(mapCenter.latitude, mapCenter.longitude);
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

      // No need to wait response
      this.#notifyToAllUser(response.data.id);
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

  async #notifyToAllUser(storyId) {
    try {
      const response = await this.#model.sendStoryToAllUserViaNotification(
        storyId
      );
      if (!response.ok) {
        console.error("#notifyToAllUser: response:", response);
        return false;
      }
      return true;
    } catch (error) {
      console.error("#notifyToAllUser: error:", error);
      return false;
    }
  }
}
