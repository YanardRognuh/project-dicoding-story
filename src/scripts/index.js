// CSS imports
import "../styles/styles.css";
import "../styles/skip-link.css";
import "../styles/form.css";
import "../styles/story.css";
import "../styles/camera.css";
import "../styles/map.css";
import "../styles/view-transitions.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";
import Camera from "./utils/camera";
import { registerServiceWorker } from "./utils/notification-helper";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();
  await registerServiceWorker();

  window.addEventListener("hashchange", async () => {
    // Stop all camera streams before navigating
    Camera.stopAllStreams();

    // Render the new page with transition
    await app.renderPage();
  });

  // Clean up camera streams when the page is closed or refreshed
  window.addEventListener("beforeunload", () => {
    Camera.stopAllStreams();
  });
});
