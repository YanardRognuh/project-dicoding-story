// presenters/home-presenter.js
import { storiesMapper } from "../data/api-mapper.js";

export default class HomePresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async showStories() {
    try {
      this.#view.showLoading();
      const response = await this.#model.getStories();

      if (response.error) {
        this.#view.showError(response.message);
        return;
      }

      const stories = this.#model.getAll();

      if (stories.length === 0) {
        this.#view.showEmpty();
        return;
      }

      const mappedStories = await storiesMapper(stories);
      this.#view.showStories(mappedStories);

      // Memanggil method di view untuk menampilkan stories di peta
      this.#view.showStoriesOnMap(mappedStories);
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
