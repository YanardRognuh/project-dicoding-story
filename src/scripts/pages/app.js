// app.js
import routes from "../routes/routes";
import {
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from "../templates";
import { getActivePathname, getActiveRoute } from "../routes/url-parser";
import UserModel from "../data/models/user-model";
import { transitionHelper } from "../utils/transition-helper";
import {
  isServiceWorkerAvailable,
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
} from "../utils/notification-helper";

class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;
    this._userModel = new UserModel();

    this._initialAppShell();
  }

  _initialAppShell() {
    // Skip to content implementation
    this._createSkipLink();

    // Initialize navigation drawer
    this._drawerButton.addEventListener("click", (event) => {
      this._navigationDrawer.classList.toggle("open");
      event.stopPropagation();
    });

    // Close drawer when clicking outside
    document.addEventListener("click", (event) => {
      if (this._navigationDrawer.classList.contains("open")) {
        this._navigationDrawer.classList.remove("open");
      }
    });

    this._updateNavigationByAuthStatus();
  }

  _createSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.setAttribute("href", "#");
    skipLink.setAttribute("class", "skip-link");
    skipLink.textContent = "Skip to content";
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Handle skip link click properly for SPA
    skipLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent page refresh
      skipLink.blur(); // Remove focus from skip link

      const mainContent = document.querySelector("#main-content");
      if (mainContent) {
        mainContent.focus(); // Set focus to main content
        mainContent.scrollIntoView(); // Scroll to main content
      }
    });
  }

  _updateNavigationByAuthStatus() {
    const navListElement = document.querySelector("#nav-list");
    const isLoggedIn = this._userModel.isLoggedIn();
    const brandName = document.querySelector(".brand-name");
    const currentPath = getActivePathname();

    // Extract base path for page type checking
    const basePath = currentPath.split("/")[1]
      ? `/${currentPath.split("/")[1]}`
      : "/";

    brandName.textContent = "Dicoding Story";

    let navItems = "";

    if (isLoggedIn) {
      // Only show push notification tools on main pages, not on login/register
      const showPushTools = !["/login", "/register"].includes(basePath);

      navItems = `
        ${
          showPushTools
            ? '<li id="push-notification-tools" class="push-notification-tools"></li>'
            : ""
        }
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/add">Tambah Cerita</a></li>
        <li><a href="#/logout" id="logout-button">Logout</a></li>
      `;
    } else {
      navItems = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
    }

    navListElement.innerHTML = navItems;

    // Handle logout
    const logoutButton = document.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        this._userModel.logout();
        window.location.hash = "#/login";
      });
    }
  }

  async #setupPushNotification() {
    // Check if user is logged in first
    if (!this._userModel.isLoggedIn()) {
      return; // Exit if not logged in
    }

    const pushNotificationTools = document.getElementById(
      "push-notification-tools"
    );

    // Check if the element exists before trying to manipulate it
    if (!pushNotificationTools) {
      console.warn("Push notification tools element not found");
      return;
    }

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

    // Make sure the button exists before adding the event listener
    const subscribeButton = document.getElementById("subscribe-button");
    if (subscribeButton) {
      subscribeButton.addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
    }
  }

  async renderPage() {
    const pathname = getActivePathname();
    const activeRoute = getActiveRoute();

    // Handle auth redirection
    if (this._shouldRedirect(pathname)) {
      return;
    }

    // Check if the route exists in our routes definition
    // First try exact match, then try dynamic route match
    const page = routes[pathname] || routes[activeRoute] || routes["/404"];

    // Use view transitions API
    const transition = transitionHelper({
      updateDOM: async () => {
        try {
          this._content.innerHTML = await page.render();
          await page.afterRender();

          // Re-set focus for accessibility after page change
          const mainContent = document.querySelector("#main-content");
          if (mainContent) {
            mainContent.setAttribute("tabindex", "-1");
            mainContent.focus();
          }
        } catch (error) {
          console.error("Error rendering page:", error);
          this._content.innerHTML =
            "<p>Terjadi kesalahan saat memuat halaman</p>";
        }
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      // Scroll to top after transition
      window.scrollTo({ top: 0, behavior: "instant" });

      // Update navigation based on current page
      this._updateNavigationByAuthStatus();

      // Only setup push notification if service worker is available
      // and we're not on login/register pages
      const basePath = pathname.split("/")[1]
        ? `/${pathname.split("/")[1]}`
        : "/";

      if (
        isServiceWorkerAvailable() &&
        this._userModel.isLoggedIn() &&
        !["/login", "/register"].includes(basePath)
      ) {
        // Wrap in try/catch to prevent any errors from breaking the app
        try {
          this.#setupPushNotification();
        } catch (error) {
          console.error("Error setting up push notifications:", error);
        }
      }
    });
  }

  _shouldRedirect(pathname) {
    const isLoggedIn = this._userModel.isLoggedIn();

    // Extract just the base path for permission checking
    const basePath = pathname.split("/")[1]
      ? `/${pathname.split("/")[1]}`
      : "/";

    // If user is not logged in, redirect to login except for login and register pages
    if (!isLoggedIn && !["/login", "/register", "/404"].includes(basePath)) {
      window.location.hash = "#/login";
      return true;
    }

    // If user is logged in, redirect from login/register to home
    if (isLoggedIn && ["/login", "/register"].includes(basePath)) {
      window.location.hash = "#/";
      return true;
    }

    return false;
  }
}

export default App;
