// presenters/story-presenter.js
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

      // Enrich story data with place name if coordinates exist
      if (response.story.lat && response.story.lon) {
        try {
          const placeName = await this.#view.getPlaceNameByCoordinate(
            response.story.lat,
            response.story.lon
          );
          response.story.placeName = placeName;
        } catch (error) {
          console.error("Error getting place name:", error);
          response.story.placeName = `${response.story.lat}, ${response.story.lon}`;
        }
      }

      this.#view.populateStoryDetail(response.story);

      // Initialize map if story has location data
      if (response.story.lat && response.story.lon) {
        await this.showStoryMap(response.story);
      }
    } catch (error) {
      console.error("showStoryDetail: error:", error);
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async showStoryMap(story) {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();

      if (story.lat && story.lon) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.name };

        this.#view.addMapMarker(coordinate, markerOptions, popupOptions);
        this.#view.changeMapCamera(coordinate, 15);
      }
    } catch (error) {
      console.error("showStoryMap: error:", error);
      this.#view.showMapError(error.message);
    } finally {
      this.#view.hideMapLoading();
    }
  }
}
