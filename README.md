# Portofolio Digital SMK Muhammadiyah 2 Bantul

Galeri karya siswa dan guru berbasis situs statis (HTML) dengan **Google Sheets + Google Apps Script** sebagai database dan backend. Tidak perlu server, tidak ada biaya hosting database, dan data bisa dikelola langsung dari Google Sheets.

## Daftar isi

1. [Fitur](#fitur)
2. [Alur penggunaan](#alur-penggunaan)
3. [Struktur file](#struktur-file)
4. [Instalasi](#instalasi)
5. [Panduan pengguna](#panduan-pengguna)
6. [Panduan admin](#panduan-admin)
7. [Struktur data spreadsheet](#struktur-data-spreadsheet)
8. [Referensi API](#referensi-api)
9. [Keamanan dan privasi](#keamanan-dan-privasi)
10. [Kustomisasi](#kustomisasi)
11. [Pemecahan masalah](#pemecahan-masalah)
12. [Keterbatasan](#keterbatasan)

---

## Fitur

- **Galeri publik** (`index.html`): menampilkan semua karya, dengan pencarian dan filter.
- **Pendaftaran terpisah** (`daftar.html`): mengisi nama, status, jurusan, dan nomor WhatsApp.
- **Kode akses otomatis**: 3 huruf dari nama + 3 angka acak, dan dijamin unik. Contoh: Wintolo menjadi `WIN123`.
- **Simpan ke WhatsApp**: hasil pendaftaran dikirim sebagai pesan rapi ke nomor WA pendaftar sendiri.
- **Upload karya terpisah** (`upload.html`): cukup memakai kode akses, tanpa ID profil.
- **Halaman admin** (`admin.html`): melihat seluruh data (karya, profil, kode akses, nomor WA) dan hanya bisa mengedit **Tautan Karya** dan **Tautan Thumbnail**.
- Mendukung tampilan terang dan gelap, serta responsif untuk ponsel.

## Alur penggunaan

```
Pengguna                         Sistem
--------                         ------
1. Buka daftar.html     ------>  Server membuat kode akses unik (mis. WIN123)
2. Simpan ke WhatsApp   <------  Kode + data dikirim ke WA pendaftar
3. Buka upload.html     ------>  Kode dicek, karya disimpan ke sheet "Works"
4. Karya tampil          <-----  index.html membaca karya yang izin publikasinya aktif

Admin
-----
5. Buka admin.html + kata sandi  ->  Lihat semua data, edit tautan karya/thumbnail
```

## Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Galeri publik |
| `daftar.html` | Halaman pendaftaran, menampilkan kode akses dan tombol simpan ke WhatsApp |
| `upload.html` | Halaman upload karya (memakai kode akses) |
| `admin.html` | Halaman admin (Kata sandi: adminmudaba) |
| `config.js` | Konfigurasi bersama: URL API, nama sekolah, logo, dan fungsi `api()` |
| `style.css` | Gaya bersama semua halaman |
| `Code.gs` | Backend Google Apps Script (tempel di Apps Script, bukan di hosting) |
| `contoh_data_portofolio.xlsx` | Contoh data siap impor |

> `Code.gs` **tidak diunggah ke hosting**. File ini hanya ditempel ke editor Apps Script.

## Instalasi

Anda butuh akun Google dan tempat hosting statis (GitHub Pages, Netlify, Cloudflare Pages, atau hosting biasa).

### 1. Siapkan Google Sheet

1. Buat Google Sheet baru.
2. *(Opsional)* Isi dengan data contoh: **File → Import → Upload** `contoh_data_portofolio.xlsx`, pilih **Insert new sheet(s)**.
3. Kalau tidak memakai data contoh, lewati langkah 2. Sheet **Profiles** dan **Works** akan dibuat otomatis saat pertama kali ada pendaftaran atau akses data.

Nama sheet harus persis `Profiles` dan `Works`.

### 2. Pasang backend (Apps Script)

1. Di Google Sheet, buka **Extensions → Apps Script**.
2. Hapus isi file bawaan, lalu tempel seluruh isi `Code.gs`. Simpan.
3. Klik **Project Settings** (ikon roda gigi) → **Script Properties** → **Add script property**:
   - Property: `ADMIN_KEY`
   - Value: kata sandi admin pilihan Anda (panjang dan sulit ditebak)
4. Klik **Save script properties**.

### 3. Deploy sebagai Web App

1. Klik **Deploy → New deployment**.
2. Pilih tipe **Web app**.
3. Atur **Execute as: Me** dan **Who has access: Anyone**.
4. Klik **Deploy**, lalu setujui izin akses Google saat diminta.
5. Salin **Web app URL** yang berakhiran `/exec`.

> **Memperbarui kode di kemudian hari:** buka **Deploy → Manage deployments**, klik ikon pensil, pilih **Version: New version**, lalu **Deploy**. Cara ini mempertahankan URL yang sama. Kalau memakai **New deployment**, URL berubah dan `config.js` harus diperbarui.

### 4. Hubungkan front-end

Buka `config.js` dan isi URL tadi:

```js
const SITE = {
  GAS_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
  name: 'SMK MUHAMMADIYAH 2 BANTUL',
  logo: 'https://.../LOGO.png'
};
```

### 5. Unggah ke hosting

Unggah `index.html`, `daftar.html`, `upload.html`, `admin.html`, `config.js`, dan `style.css` ke folder yang sama. Contoh GitHub Pages: unggah file ke repositori, lalu aktifkan **Settings → Pages**.

Disarankan membuka situs lewat alamat hosting, bukan dengan membuka file langsung dari komputer (`file://`), karena sebagian peramban membatasi permintaan dari file lokal.

### 6. Uji coba

1. Buka `daftar.html`, daftar dengan nama dan nomor WA Anda, lalu catat kode akses.
2. Buka `upload.html`, kirim satu karya contoh.
3. Buka `index.html`, karya akan muncul di galeri.
4. Buka `admin.html`, masuk dengan `ADMIN_KEY`, dan pastikan data terlihat.

## Panduan pengguna

### Mendaftar

1. Buka halaman **Daftar**.
2. Isi **nama lengkap**, **status** (Siswa/Guru), **jurusan**, dan **nomor WhatsApp**. Nomor boleh ditulis `08123456789`, sistem mengubahnya otomatis ke format `628123456789`.
3. Centang persetujuan publikasi, lalu klik **Daftar**.
4. Kode akses ditampilkan, misalnya `WIN123`.
5. Klik **Simpan ke WhatsApp**. WhatsApp terbuka dengan pesan berisi nama, status, jurusan, nomor WA, kode akses, dan tautan upload. Tekan **kirim** (pesan masuk ke chat dengan nomor Anda sendiri), lalu **sematkan (pin)** chat itu agar mudah dicari.
6. Tombol **Salin kode** tersedia kalau Anda ingin menyalin kodenya saja.

> Kode akses berfungsi seperti kata sandi untuk upload karya atas nama Anda. Jangan dibagikan ke orang lain.

### Mengupload karya

1. Buka halaman **Upload karya**.
2. Masukkan **kode akses** (contoh `WIN123`).
3. Isi **judul**, **deskripsi**, **kategori**, **kelas**, **tahun**, **tautan karya** (wajib `https://`), **tautan thumbnail** (opsional, `https://`), **guru pembimbing**, dan **mata pelajaran**.
4. Klik **Kirim karya**. Pesan konfirmasi menampilkan nama pemilik kode.
5. Untuk karya berikutnya, kode akses tetap terisi, jadi cukup isi data karya baru.

Kategori yang tersedia: Game, Video, Website, Poster, Media Pembelajaran.

### Lupa kode akses

Cari pesan pendaftaran di WhatsApp Anda. Kalau hilang, minta admin mencarikan kode di tab **Profil & kode akses**.

## Panduan admin

### Masuk

1. Pastikan `ADMIN_KEY` sudah diatur di Script Properties (lihat [Instalasi](#2-pasang-backend-apps-script)).
2. Buka `admin.html` (juga ada tautan **Admin** di footer halaman utama).
3. Masukkan kata sandi, lalu klik **Masuk**.

Sesi disimpan hanya selama tab terbuka. Klik **Keluar** untuk mengakhiri sesi.

### Yang bisa dilakukan

| Fitur | Keterangan |
|---|---|
| Tab **Karya** | Semua karya, termasuk milik profil yang tidak mengizinkan publikasi |
| Tab **Profil & kode akses** | Nama, status, jurusan, nomor WA, kode akses, izin publikasi, jumlah karya |
| Pencarian | Cari nama, judul, kategori, kode, dan sebagainya |
| **Edit tautan** | Mengubah **Tautan Karya** dan **Tautan Thumbnail** saja |
| **Muat ulang** | Mengambil data terbaru dari spreadsheet |

Admin tidak bisa mengubah judul, deskripsi, atau data profil lewat halaman ini. Batasan ini ditegakkan di server, bukan hanya di tampilan.

### Hal yang dikelola langsung di Google Sheet

Beberapa data diatur manual di spreadsheet:

- **Bintang** (`stars`) dan **sertifikasi** (`certified`, `TRUE`/`FALSE`) pada sheet `Works`.
- **Izin publikasi** (`consent`) pada sheet `Profiles`. Hanya profil dengan `TRUE` yang karyanya tampil di galeri.
- Menghapus karya atau profil: hapus barisnya di sheet.
- Mengganti kata sandi admin: ubah nilai `ADMIN_KEY` di Script Properties (langsung berlaku, tanpa deploy ulang).

## Struktur data spreadsheet

### Sheet `Profiles`

| Kolom | Isi |
|---|---|
| `id` | ID unik 8 karakter (dibuat otomatis) |
| `name` | Nama lengkap |
| `status` | `Siswa` atau `Guru` |
| `department` | Jurusan atau program keahlian |
| `wa` | Nomor WhatsApp berformat `62...` (teks) |
| `access_code` | Kode akses, 3 huruf + 3 angka (teks) |
| `consent` | `TRUE` jika mengizinkan publikasi |
| `created` | Waktu pendaftaran |
| `avatar` | URL foto profil (opsional) |

### Sheet `Works`

| Kolom | Isi |
|---|---|
| `key` | Nomor urut karya |
| `id` | ID pemilik, sama dengan `id` di `Profiles` |
| `title`, `desc` | Judul dan deskripsi |
| `category` | Game, Video, Website, Poster, atau Media Pembelajaran |
| `cls`, `year` | Kelas dan tahun |
| `link` | Tautan karya (`https://`) |
| `image` | Tautan thumbnail (`https://`, boleh kosong) |
| `guru`, `mapel` | Guru pembimbing dan mata pelajaran |
| `stars` | Jumlah bintang (diisi admin) |
| `certified` | `TRUE`/`FALSE` (diisi admin) |
| `date` | Waktu upload |

Jangan mengubah nama sheet, urutan kolom, atau nama kolom pada baris pertama.

## Referensi API

Semua permintaan dikirim ke URL Web App (`GAS_URL`). Respons berbentuk `{ "ok": true, "data": ... }` atau `{ "ok": false, "error": "pesan" }`.

| Metode | Aksi | Parameter | Keterangan |
|---|---|---|---|
| GET | `?action=works` | none | Daftar karya publik (tanpa kode akses dan WA) |
| POST | `register` | `name`, `status`, `department`, `wa`, `publish_consent` | Membuat profil, mengembalikan `code` |
| POST | `addWork` | `access_code`, `title`, `desc`, `category`, `cls`, `year`, `link`, `image`, `guru`, `mapel` | Menambah karya |
| POST | `adminList` | `admin_key` | Seluruh profil dan karya |
| POST | `adminUpdateLinks` | `admin_key`, `key`, `link`, `image` | Mengubah dua tautan |

Permintaan POST dikirim sebagai JSON dengan header `Content-Type: text/plain;charset=utf-8` agar tidak memicu preflight CORS pada Apps Script. Gunakan fungsi `api()` di `config.js`.

## Keamanan dan privasi

- Galeri publik **tidak pernah** menerima kode akses atau nomor WA.
- Nomor WA dan kode akses hanya terlihat di halaman admin dan di Google Sheet.
- Batasi akses berbagi Google Sheet hanya untuk pengelola. Siapa pun yang punya akses edit bisa melihat semua data.
- Validasi dilakukan di server: kode akses harus ada, tautan wajib `https://`, kategori harus valid, dan admin hanya bisa mengubah `link` dan `image`.
- Input yang diawali `=`, `+`, `-`, atau `@` diberi awalan agar tidak dibaca sebagai rumus spreadsheet.
- Kata sandi admin yang salah ditunda sekitar 1,5 detik per percobaan untuk memperlambat tebakan.
- Pendaftaran dengan nama dan nomor WA yang sama ditolak untuk mencegah profil ganda.
- `admin.html` diberi `noindex` agar tidak muncul di mesin pencari, tetapi alamatnya tidak rahasia. Keamanannya ada pada kata sandi.

Minta persetujuan pendaftar sebelum mempublikasikan data. Nomor WA tergolong data pribadi.

## Kustomisasi

| Ingin mengubah | Lakukan |
|---|---|
| Nama sekolah dan logo (halaman daftar, upload, admin) | Edit `SITE` di `config.js` |
| Tampilan halaman utama | Edit bagian `APP_CONFIG` di skrip `index.html` |
| Warna dan gaya | Edit variabel CSS di `style.css` |
| Daftar kategori | Ubah `CATS` di `Code.gs` **dan** pilihan kategori di `upload.html` (harus sama), lalu deploy versi baru |
| Panjang kode akses | Ubah `makeCode_` di `Code.gs` dan pola `pattern` di `upload.html` |
| Pilihan jurusan | Saat ini isian bebas. Ubah menjadi `<select>` di `daftar.html` kalau ingin dibakukan |

Setiap perubahan pada `Code.gs` baru berlaku setelah **deploy versi baru**.

## Pemecahan masalah

| Gejala | Penyebab dan solusi |
|---|---|
| Galeri menampilkan "URL API belum diisi" | `GAS_URL` di `config.js` belum diisi atau bukan URL `/exec` yang benar |
| "Aksi tidak dikenal" | Deployment masih memakai kode lama. Deploy versi baru |
| Gagal memuat data, atau error jaringan | Akses Web App belum **Anyone**, atau Anda mengubah akses setelah deploy tanpa membuat versi baru |
| "Kode akses tidak ditemukan" | Kode salah ketik, atau profil belum ada di sheet `Profiles`. Kode tidak membedakan huruf besar dan kecil |
| "Kata sandi admin salah" | Nama properti harus persis `ADMIN_KEY`, dan nilainya tidak boleh ada spasi di awal atau akhir |
| Karya tidak tampil di galeri | Cek `consent` pemilik profil harus `TRUE`, dan `id` di `Works` harus sama dengan `id` di `Profiles` |
| Nomor WA berubah jadi angka aneh | Format kolom `wa` dan `access_code` harus **Plain text**. Pilih kolomnya, lalu **Format → Number → Plain text** |
| Sheet ganda (`Profiles 2`, `Works 2`) | Saat impor, sheet lama belum dihapus. Hapus sheet lama dan ganti nama sheet baru |
| Tombol WhatsApp tidak membuka aplikasi | Pastikan WhatsApp terpasang, atau pakai WhatsApp Web |
| "Nama dan nomor WA ini sudah terdaftar" | Orang tersebut sudah mendaftar. Cari kodenya di WhatsApp atau minta admin |

## Keterbatasan

- Pengguna tidak bisa mengedit atau menghapus karya sendiri. Perubahan dilakukan admin (tautan lewat halaman admin, data lain langsung di spreadsheet).
- Tidak ada pembatasan jumlah upload per pengguna.
- Google Apps Script punya kuota harian. Untuk sekolah dengan ratusan pengguna aktif, ini umumnya cukup, tetapi pantau bila trafik tinggi.
- Backend memproses satu permintaan tulis pada satu waktu (memakai kunci) agar kode akses tidak bentrok. Pada beban sangat tinggi, permintaan bisa menunggu beberapa detik.
- Kode akses tidak bisa dibuat ulang otomatis. Kalau perlu mengganti, ubah nilainya langsung di sheet `Profiles`.
