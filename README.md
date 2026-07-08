# LeafLens - AI Plant Identifier 🌿

LeafLens adalah aplikasi web cerdas berbasis AI yang membantu Anda mengidentifikasi jenis tanaman, mendeteksi penyakit tanaman, dan memberikan panduan cara merawatnya secara instan.

Proyek ini menggunakan model AI generatif **Google Gemini** untuk menganalisis gambar tanaman yang diunggah oleh pengguna, baik melalui file maupun langsung dari kamera.

## 🚀 Fitur Utama

- **Identifikasi Cepat**: Unggah foto dan ketahui nama tanaman serta informasi detail tentang tanaman tersebut.
- **Deteksi Penyakit & Hama**: AI akan mengecek kesehatan daun atau batang dan memberikan saran penanganan.
- **Komparasi Tanaman**: Bandingkan dua foto tanaman (misal: kondisi minggu lalu vs sekarang) untuk melihat progres kesehatan.
- **Jurnal Koleksi**: Simpan hasil identifikasi tanaman favorit Anda ke dalam Jurnal Koleksi secara lokal (disimpan di browser).
- **Pengingat Perawatan (Reminders)**: Atur jadwal penyiraman, pemupukan, dan pengecekan cahaya matahari.
- **Bilingual**: Mendukung antarmuka dan hasil analisis dalam Bahasa Indonesia dan Bahasa Inggris.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+).
- **Backend/API**: Node.js (untuk mem-proxy permintaan AI secara aman).
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`).
- **Deployment**: Vercel.

## 💻 Cara Menjalankan Secara Lokal (Local Development)

Proyek ini sangat ringan dan menggunakan modul bawaan Node.js, sehingga **tidak memerlukan `npm install`**.

### Persyaratan
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru.
- API Key dari Google Gemini (Dapatkan di [Google AI Studio](https://aistudio.google.com/)).

### Langkah-langkah

1. **Clone repository ini**
   ```bash
   git clone https://github.com/raihanh2644-creator/identifikasi-tanaman.git
   cd identifikasi-tanaman
   ```

2. **Siapkan Environment Variables**
   Duplikat file `.env.example` menjadi `.env` lalu masukkan API Key Anda:
   ```bash
   # Windows (CMD/PowerShell)
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```
   Buka file `.env` di teks editor, lalu ubah baris berikut:
   ```env
   GEMINI_API_KEY=masukkan_api_key_anda_disini
   GEMINI_MODEL=gemini-2.5-flash
   ```

3. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```

4. **Buka di Browser**
   Buka URL berikut di browser Anda:
   👉 **http://localhost:8001**


## 📝 Catatan Tambahan
- Fitur kamera mungkin tidak bisa diakses jika Anda tidak menggunakan `localhost` atau HTTPS (pembatasan privasi standar browser).
- Data jurnal disimpan di `localStorage` browser masing-masing pengguna.
