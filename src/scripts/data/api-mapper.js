// data/api-mapper.js
import Map from "../utils/map";

export async function storyMapper(story) {
  // Skip if no location data
  if (!story.lat || !story.lon) {
    return story;
  }

  try {
    const placeName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);

    return {
      ...story,
      placeName,
    };
  } catch (error) {
    console.error("storyMapper error:", error);
    return {
      ...story,
      placeName: `${story.lat}, ${story.lon}`,
    };
  }
}

export async function storiesMapper(stories) {
  const mappingPromises = stories.map((story) => storyMapper(story));
  return Promise.all(mappingPromises);
}
