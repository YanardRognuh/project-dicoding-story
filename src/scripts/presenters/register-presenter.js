export default class RegisterPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  initListeners() {
    // Hanya inisialisasi listener, implementasi ada di view
    this.#view.initFormValidation();
    this.#view.initFormSubmission(this.handleRegister.bind(this));
  }

  validateName(name) {
    if (!name) {
      return { isValid: false, message: "Nama tidak boleh kosong" };
    }
    return { isValid: true };
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

    if (password.length < 8) {
      return { isValid: false, message: "Password minimal 8 karakter" };
    }

    return { isValid: true };
  }

  async handleRegister(formData) {
    // Validasi data form
    const nameValidation = this.validateName(formData.name);
    const emailValidation = this.validateEmail(formData.email);
    const passwordValidation = this.validatePassword(formData.password);

    // Jika ada validasi yang tidak valid, tampilkan pesan error
    if (!nameValidation.isValid) {
      this.#view.showFieldError("name", nameValidation.message);
      return false;
    }

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

      // Panggil model untuk register
      const response = await this.#model.register(formData);

      if (response.error) {
        this.#view.showError(response.message);
        return false;
      } else {
        this.#view.showSuccess(
          'Registrasi berhasil! Silakan <a href="#/login">login</a>.'
        );
        this.#view.resetForm();
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
