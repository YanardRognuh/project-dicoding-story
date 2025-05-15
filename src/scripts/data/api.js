import CONFIG from "../config";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.AUTH_KEY);

    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error:", error);
    return null;
  }
}

async function fetchWithToken(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
}

export async function register({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return await response.json();
}

export async function login({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return await response.json();
}

export async function getStories() {
  const response = await fetchWithToken(ENDPOINTS.GET_STORIES);
  return await response.json();
}

export async function getStoryById(id) {
  // Add debugging log to see what ID is being requested
  console.log(`Fetching story detail with ID: ${id}`);
  const response = await fetchWithToken(ENDPOINTS.GET_STORY_DETAIL(id));

  // Add debugging to see the response
  const result = await response.json();
  console.log("API Response for getStoryById:", result);
  return result;
}

export async function addStory({ description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    // Only append coordinates if they're valid numbers
    if (lat !== null && !isNaN(lat)) {
      formData.append("lat", lat);
      console.log("Added lat to form data:", lat);
    }

    if (lon !== null && !isNaN(lon)) {
      formData.append("lon", lon);
      console.log("Added lon to form data:", lon);
    }

    // Log the form data entries for debugging
    console.log("FormData contents:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    const response = await fetchWithToken(ENDPOINTS.ADD_STORY, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("API Response for addStory:", result);
    return result;
  } catch (error) {
    console.error("Error in API addStory:", error);
    return { error: true, message: error.message || "Unknown error occurred" };
  }
}

export async function subscribePushNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
