export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  initListeners() {
    const form = this.#view.getElement("#loginForm");
    const emailInput = this.#view.getElement("#email");
    const passwordInput = this.#view.getElement("#password");

    // Form submit event
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.handleLogin();
    });

    // Real-time validation
    emailInput.addEventListener("input", () => this.validateEmail());
    passwordInput.addEventListener("input", () => this.validatePassword());

    // Blur event for accessibility
    emailInput.addEventListener("blur", () => this.validateEmail());
    passwordInput.addEventListener("blur", () => this.validatePassword());
  }

  validateEmail() {
    const emailInput = this.#view.getElement("#email");

    if (emailInput.validity.valueMissing) {
      this.#view.showFieldError("email", "Email tidak boleh kosong");
      return false;
    } else if (emailInput.validity.typeMismatch) {
      this.#view.showFieldError("email", "Format email tidak valid");
      return false;
    }

    this.#view.clearFieldError("email");
    return true;
  }

  validatePassword() {
    const passwordInput = this.#view.getElement("#password");

    if (passwordInput.validity.valueMissing) {
      this.#view.showFieldError("password", "Password tidak boleh kosong");
      return false;
    }

    this.#view.clearFieldError("password");
    return true;
  }

  async handleLogin() {
    // Clear previous errors
    this.#view.getElement("#errorContainer").innerHTML = "";

    // Validate all fields
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (isEmailValid && isPasswordValid) {
      try {
        this.#view.showLoading();

        const { email, password } = this.#view.getFormData();
        const response = await this.#model.login({ email, password });

        if (response.error) {
          this.#view.showError(response.message);
        } else {
          // Redirect to home page on successful login
          this.#view.navigateTo("#/");
        }
      } catch (error) {
        this.#view.showError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        this.#view.hideLoading();
      }
    }
  }
}
