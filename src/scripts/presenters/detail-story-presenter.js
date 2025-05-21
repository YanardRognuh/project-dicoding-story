export default class StoryPresenter {
  #storyId;
  #view;
  #storyModel;
  #dbModel;

  constructor(storyId, { view, storyModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#storyModel = storyModel;
    this.#dbModel = dbModel;
  }

  async showStoryDetail() {
    this.#view.showLoading();
    try {
      const response = await this.#storyModel.getStoryById(this.#storyId);

      if (response.error) {
        console.error("showStoryDetail: response:", response);
        this.#view.showError(response.message);
        return;
      }

      // Meneruskan data story ke view untuk ditampilkan
      await this.#view.populateStoryDetail(response.story);

      // Memberi tahu view bahwa perlu menampilkan peta jika ada data lokasi
      if (response.story.lat && response.story.lon) {
        this.#view.displayStoryMap(response.story);
      }
    } catch (error) {
      console.error("showStoryDetail: error:", error);
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async saveStory() {
    try {
      // Get the story first if we need the complete data
      const response = await this.#storyModel.getStoryById(this.#storyId);

      if (response.error) {
        throw new Error(
          response.message || "Gagal mendapatkan detail cerita untuk disimpan"
        );
      }

      // Save to IndexedDB
      await this.#dbModel.putStories(response.story);
      this.#view.saveToBookmarkSuccessfully("Berhasil menyimpan cerita");
    } catch (error) {
      console.error("saveStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStories(this.#storyId);
      this.#view.removeFromBookmarkSuccessfully(
        "Berhasil menghapus cerita dari tersimpan"
      );
    } catch (error) {
      console.error("removeStory: error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showBookmarkButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }
    this.#view.renderSaveButton();
  }

  async #isStorySaved() {
    try {
      const story = await this.#dbModel.getStoriesById(this.#storyId);
      return !!story; // Convert to boolean
    } catch (error) {
      console.error("isStorySaved: error:", error);
      return false;
    }
  }
}
