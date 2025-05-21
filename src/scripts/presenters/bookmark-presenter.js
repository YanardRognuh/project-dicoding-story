// presenters/bookmark-presenter.js - Updated
import { storiesMapper } from "../data/api-mapper.js";

export default class BookmarkPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async showBookmarkedStories() {
    try {
      this.#view.showLoading();

      // Get bookmarked stories from IndexedDB
      const stories = await this.#model.getAllBookmarkedStories();

      if (stories.length === 0) {
        this.#view.showEmpty();
        return;
      }

      // Map the stories if needed
      const mappedStories = await storiesMapper(stories);

      // Show stories in the list
      this.#view.showStories(mappedStories);

      // Show stories on the map
      this.#view.showStoriesOnMap(mappedStories);
    } catch (error) {
      console.error("showBookmarkedStories error:", error);
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
