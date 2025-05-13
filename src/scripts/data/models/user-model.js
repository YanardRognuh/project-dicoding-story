import CONFIG from "../../config";
import { login as loginApi, register as registerApi } from "../api";

class UserModel {
  constructor() {
    this._storageKey = CONFIG.AUTH_KEY;
  }

  async login({ email, password }) {
    try {
      const response = await loginApi({ email, password });

      if (!response.error) {
        localStorage.setItem(this._storageKey, response.loginResult.token);
      }

      return response;
    } catch (error) {
      return { error: true, message: "Login gagal. Terjadi kesalahan." };
    }
  }

  async register({ name, email, password }) {
    try {
      return await registerApi({ name, email, password });
    } catch (error) {
      return { error: true, message: "Registrasi gagal. Terjadi kesalahan." };
    }
  }

  isLoggedIn() {
    return !!localStorage.getItem(this._storageKey);
  }

  logout() {
    localStorage.removeItem(this._storageKey);
  }
}

export default UserModel;
