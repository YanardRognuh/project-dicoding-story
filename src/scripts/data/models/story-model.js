import { getStories, getStoryById, addStory } from "../api";
import Database from "../database.js";

class StoryModel {
  constructor() {
    this._stories = [];
    this._database = Database;
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

  // Add methods to work with the Database for bookmarked stories
  async getAllBookmarkedStories() {
    try {
      return await this._database.getAllStories();
    } catch (error) {
      console.error("getAllBookmarkedStories error:", error);
      return [];
    }
  }

  async bookmarkStory(story) {
    try {
      return await this._database.putStories(story);
    } catch (error) {
      console.error("bookmarkStory error:", error);
      throw error;
    }
  }

  async isStoryBookmarked(id) {
    try {
      const story = await this._database.getStoriesById(id);
      return !!story;
    } catch (error) {
      console.error("isStoryBookmarked error:", error);
      return false;
    }
  }

  async deleteBookmarkedStory(id) {
    try {
      return await this._database.removeStories(id);
    } catch (error) {
      console.error("deleteBookmarkedStory error:", error);
      throw error;
    }
  }
}

export default StoryModel;
