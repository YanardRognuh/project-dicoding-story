import UserModel from "../../data/models/user-model.js";
import LoginPresenter from "../../presenters/login-presenter.js";

export default class LoginPage {
  #userModel;
  #presenter;

  constructor() {
    this.#userModel = new UserModel();
    this.#presenter = new LoginPresenter({
      model: this.#userModel,
      view: this,
    });
  }

  async render() {
    return `
      <section class="container">
        <h1 class="visually-hidden">Login Page</h1>
        
        <form id="loginForm" class="auth-form">
          <h2>Login</h2>
          <div id="errorContainer"></div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" class="form-control" required>
            <span class="form-error email-error"></span>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" class="form-control" required>
            <span class="form-error password-error"></span>
          </div>
          
          <button type="submit" class="form-button">
            <span class="button-text">Login</span>
            <span class="loader" style="display: none;"></span>
          </button>
          <a href="#/register" class="form-link">Belum punya akun? Daftar</a>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter.initListeners();
  }

  // View methods untuk inisialisasi event handlers
  initFormValidation() {
    const emailInput = this.getElement("#email");
    const passwordInput = this.getElement("#password");

    // Real-time validation menggunakan event input
    emailInput.addEventListener("input", () => {
      const email = emailInput.value;
      const validation = this.#presenter.validateEmail(email);

      if (!validation.isValid) {
        this.showFieldError("email", validation.message);
      } else {
        this.clearFieldError("email");
      }
    });

    passwordInput.addEventListener("input", () => {
      const password = passwordInput.value;
      const validation = this.#presenter.validatePassword(password);

      if (!validation.isValid) {
        this.showFieldError("password", validation.message);
      } else {
        this.clearFieldError("password");
      }
    });

    // Blur events untuk accessibility
    emailInput.addEventListener("blur", () => {
      const email = emailInput.value;
      const validation = this.#presenter.validateEmail(email);

      if (!validation.isValid) {
        this.showFieldError("email", validation.message);
      }
    });

    passwordInput.addEventListener("blur", () => {
      const password = passwordInput.value;
      const validation = this.#presenter.validatePassword(password);

      if (!validation.isValid) {
        this.showFieldError("password", validation.message);
      }
    });
  }

  initFormSubmission(loginHandler) {
    const form = this.getElement("#loginForm");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.getElement("#errorContainer").innerHTML = "";

      // Ambil data form
      const formData = this.getFormData();

      // Serahkan data ke handler di presenter
      await loginHandler(formData);
    });
  }

  // Utility methods
  getElement(selector) {
    return document.querySelector(selector);
  }

  getFormData() {
    return {
      email: this.getElement("#email").value,
      password: this.getElement("#password").value,
    };
  }

  // UI update methods
  showError(message, selector = "#errorContainer") {
    const container = this.getElement(selector);
    container.innerHTML = `
      <div class="alert alert-error">${message}</div>
    `;
  }

  showSuccess(message, selector = "#errorContainer") {
    const container = this.getElement(selector);
    container.innerHTML = `
      <div class="alert alert-success">${message}</div>
    `;
  }

  showLoading() {
    const submitButton = this.getElement('button[type="submit"]');
    const buttonText = this.getElement(".button-text");
    const loader = this.getElement(".loader");

    submitButton.disabled = true;
    buttonText.textContent = "Loading...";
    loader.style.display = "inline-block";
  }

  hideLoading() {
    const submitButton = this.getElement('button[type="submit"]');
    const buttonText = this.getElement(".button-text");
    const loader = this.getElement(".loader");

    submitButton.disabled = false;
    buttonText.textContent = "Login";
    loader.style.display = "none";
  }

  showFieldError(field, message) {
    const errorElement = this.getElement(`.${field}-error`);
    const inputElement = this.getElement(`#${field}`);

    errorElement.textContent = message;
    inputElement.classList.add("invalid");
  }

  clearFieldError(field) {
    const errorElement = this.getElement(`.${field}-error`);
    const inputElement = this.getElement(`#${field}`);

    errorElement.textContent = "";
    inputElement.classList.remove("invalid");
  }

  resetForm() {
    this.getElement("#loginForm").reset();
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
