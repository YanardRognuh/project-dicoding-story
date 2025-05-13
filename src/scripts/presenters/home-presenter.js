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

      await this.showStoriesOnMap(mappedStories);
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async showStoriesOnMap(stories) {
    try {
      await this.#view.initializeMap();

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          const coordinate = [story.lat, story.lon];
          const markerOptions = { alt: story.name };
          const popupOptions = {
            content: `
              <div class="map-popup">
                <h3>${story.name}</h3>
                <a href="#/story/${story.id}">Lihat Detail</a>
                
              </div>
            `,
          };

          this.#view.addMapMarker(coordinate, markerOptions, popupOptions);
        }
      });
    } catch (error) {
      this.#view.showMapError(error.message);
    } finally {
      this.#view.hideMapLoading();
    }
  }
}
