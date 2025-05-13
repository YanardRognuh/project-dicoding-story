import UserModel from "../../data/models/user-model.js";
import RegisterPresenter from "../../presenters/register-presenter.js";

export default class RegisterPage {
  #userModel;
  #presenter;

  constructor() {
    this.#userModel = new UserModel();
    this.#presenter = new RegisterPresenter({
      model: this.#userModel,
      view: this,
    });
  }

  async render() {
    return `
      <section class="container">
        <h1 class="visually-hidden">Register Page</h1>
        
        <form id="registerForm" class="auth-form">
          <h2>Register</h2>
          <div id="errorContainer"></div>
          
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" class="form-control" required>
            <span class="form-error name-error"></span>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" class="form-control" required>
            <span class="form-error email-error"></span>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" class="form-control" required minlength="8">
            <span class="form-error password-error"></span>
          </div>
          
          <button type="submit" class="form-button">
            <span class="button-text">Register</span>
            <span class="loader" style="display: none;"></span>
          </button>
          <a href="#/login" class="form-link">Sudah punya akun? Login</a>
        </form>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter.initListeners();
  }

  getElement(selector) {
    return document.querySelector(selector);
  }

  getFormData() {
    return {
      name: this.getElement("#name").value,
      email: this.getElement("#email").value,
      password: this.getElement("#password").value,
    };
  }

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
    buttonText.textContent = "Register";
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
    this.getElement("#registerForm").reset();
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
