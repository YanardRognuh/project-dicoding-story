// presenters/detail-story-presenter.js
export default class StoryPresenter {
  #storyId;
  #view;
  #storyModel;

  constructor(storyId, { view, storyModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#storyModel = storyModel;
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
}
