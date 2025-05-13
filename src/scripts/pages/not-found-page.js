class NotFoundPage {
  async render() {
    return `
      <section class="container">
        <div class="not-found">
          <h1>404 - Halaman Tidak Ditemukan</h1>
          <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
          <a href="#/" class="form-button">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Nothing to do here
  }
}

export default NotFoundPage;
