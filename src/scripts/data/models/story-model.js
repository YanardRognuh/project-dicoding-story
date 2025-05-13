import { getStories, getStoryById, addStory } from "../api";

class StoryModel {
  constructor() {
    this._stories = [];
  }

  async getStories() {
    try {
      const response = await getStories();

      if (!response.error) {
        this._stories = response.listStory;
      }

      return response;
    } catch (error) {
      return { error: true, message: "Gagal mengambil data cerita." };
    }
  }

  async getStoryById(id) {
    try {
      const response = await getStoryById(id);

      return response;
    } catch (error) {
      return { error: true, message: "Gagal mengambil detail cerita." };
    }
  }

  async addStory({ description, photo, lat, lon }) {
    try {
      // Ensure lat/lon are numbers or null
      const latitude = lat !== null ? parseFloat(lat) : null;
      const longitude = lon !== null ? parseFloat(lon) : null;

      console.log(
        `Adding story with coordinates: lat=${latitude}, lon=${longitude}`
      );

      return await addStory({
        description,
        photo,
        lat: latitude,
        lon: longitude,
      });
    } catch (error) {
      console.error("Error in addStory:", error);
      return { error: true, message: "Gagal menambahkan cerita." };
    }
  }

  getAll() {
    return this._stories;
  }
}

export default StoryModel;
