export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  initListeners() {
    // Hanya inisialisasi listener, implementasi ada di view
    this.#view.initFormValidation();
    this.#view.initFormSubmission(this.handleLogin.bind(this));
  }

  validateEmail(email) {
    if (!email) {
      return { isValid: false, message: "Email tidak boleh kosong" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Format email tidak valid" };
    }

    return { isValid: true };
  }

  validatePassword(password) {
    if (!password) {
      return { isValid: false, message: "Password tidak boleh kosong" };
    }

    return { isValid: true };
  }

  async handleLogin(formData) {
    // Validasi data form
    const emailValidation = this.validateEmail(formData.email);
    const passwordValidation = this.validatePassword(formData.password);

    // Jika ada validasi yang tidak valid, tampilkan pesan error
    if (!emailValidation.isValid) {
      this.#view.showFieldError("email", emailValidation.message);
      return false;
    }

    if (!passwordValidation.isValid) {
      this.#view.showFieldError("password", passwordValidation.message);
      return false;
    }

    try {
      this.#view.showLoading();

      // Panggil model untuk login
      const response = await this.#model.login(formData);

      if (response.error) {
        this.#view.showError(response.message);
        return false;
      } else {
        // Redirect to home page on successful login
        this.#view.navigateTo("#/");
        return true;
      }
    } catch (error) {
      this.#view.showError("Terjadi kesalahan. Silakan coba lagi.");
      return false;
    } finally {
      this.#view.hideLoading();
    }
  }
}
