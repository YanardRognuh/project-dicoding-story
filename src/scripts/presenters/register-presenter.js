export default class RegisterPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  initListeners() {
    const form = this.#view.getElement("#registerForm");
    const nameInput = this.#view.getElement("#name");
    const emailInput = this.#view.getElement("#email");
    const passwordInput = this.#view.getElement("#password");

    // Form submit event
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this.handleRegister();
    });

    // Real-time validation
    nameInput.addEventListener("input", () => this.validateName());
    emailInput.addEventListener("input", () => this.validateEmail());
    passwordInput.addEventListener("input", () => this.validatePassword());

    // Blur event for accessibility
    nameInput.addEventListener("blur", () => this.validateName());
    emailInput.addEventListener("blur", () => this.validateEmail());
    passwordInput.addEventListener("blur", () => this.validatePassword());
  }

  validateName() {
    const nameInput = this.#view.getElement("#name");

    if (nameInput.validity.valueMissing) {
      this.#view.showFieldError("name", "Nama tidak boleh kosong");
      return false;
    }

    this.#view.clearFieldError("name");
    return true;
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
    } else if (passwordInput.value.length < 8) {
      this.#view.showFieldError("password", "Password minimal 8 karakter");
      return false;
    }

    this.#view.clearFieldError("password");
    return true;
  }

  async handleRegister() {
    // Clear previous errors
    this.#view.getElement("#errorContainer").innerHTML = "";

    // Validate all fields
    const isNameValid = this.validateName();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();

    if (isNameValid && isEmailValid && isPasswordValid) {
      try {
        this.#view.showLoading();

        const { name, email, password } = this.#view.getFormData();
        const response = await this.#model.register({ name, email, password });

        if (response.error) {
          this.#view.showError(response.message);
        } else {
          this.#view.showSuccess(
            'Registrasi berhasil! Silakan <a href="#/login">login</a>.'
          );
          this.#view.resetForm();
        }
      } catch (error) {
        this.#view.showError("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        this.#view.hideLoading();
      }
    }
  }
}
