# Portofolio Digital Pendidik dan Peserta Didik

Status: kode belum diuji terhadap spreadsheet dan deployment nyata. Jalankan checklist di bawah setelah deploy.

## 1. Hubungkan Google Sheets
1. Buka spreadsheet (ID `1bs7699lIF_KS_rfbvwoS8ZfBS5jDfNNsgorfdn3LGTM`), pilih Extensions > Apps Script.
2. Tempel isi `Code.gs`. Jika data ada di sheet selain sheet pertama, isi `CFG.SHEET_NAME`.
3. Pastikan urutan kolom sama dengan header (25 kolom). Kode memakai posisi kolom, sehingga `submitted_at` ganda aman (kolom 1 = waktu input baris, kolom 20 = waktu kirim karya).

## 2. Deploy Web App
Deploy > New deployment > Web app. Execute as: **Me**. Who has access: **Anyone**. Salin URL yang berakhiran `/exec`, lalu isi `APP_CONFIG.GAS_URL` di `index.html`. Setiap perubahan `Code.gs` perlu "Manage deployments > Edit > New version".

## 3. Konfigurasi `APP_CONFIG`
`GAS_URL`, `siteName`, `school`, `logo` (emoji atau URL https), `colorPrimary`, `colorAccent`, `adminContact`, `enableRegistration`, `pageSize`, `tiers` (ambang Bronze, Silver, Gold, Diamond). Untuk menutup penulisan, set `enableRegistration:false` dan `CFG.ENABLE_WRITE=false`.

## 4. GitHub Pages
Buat repositori, unggah `index.html`, lalu Settings > Pages > Deploy from branch > `main` / root. Alamat: `https://USERNAME.github.io/NAMA-REPO/`.

## 5. Keamanan dan pemeliharaan
- API publik hanya mengirim rekaman `work_type=work` dengan `publish_consent=TRUE`. `access_code`, `contact`, dan registrasi tidak pernah dikirim ke browser.
- Kode akses baru disimpan sebagai hash SHA-256. Kode lama (teks biasa) tetap bisa dipakai, tetapi sebaiknya diganti hash.
- Tulis dibatasi: kirim karya butuh ID + kode akses yang cocok; semua input divalidasi dan dipotong panjangnya; tautan wajib https.
- `stars`, `certified`, `quiz_score` hanya diubah admin langsung di spreadsheet. Tidak ada endpoint untuk mengubahnya.
- Batasan: Web App "Anyone" tidak punya rate limit bawaan selain kuota Apps Script. Pantau sheet dari spam.
- Data baru ditambahkan dengan `appendRow`, sehingga data lama tidak tertimpa.

## 6. Checklist pengujian
- [ ] `URL/exec?action=ping` mengembalikan `{"ok":true}`.
- [ ] `URL/exec?action=works` tidak memuat `access_code` atau `contact`.
- [ ] Baris dengan `publish_consent=FALSE` tidak tampil.
- [ ] Statistik cocok dengan hitungan manual; satu pengguna dengan banyak karya dihitung satu kontributor.
- [ ] Pencarian, semua filter, urutan, reset, dan "muat lebih banyak" bekerja.
- [ ] Karya YouTube bisa diputar; game/website terbuka di tab baru.
- [ ] Karya dengan `certified=FALSE` tidak berlabel tersertifikasi.
- [ ] Registrasi dan kirim karya menambah baris baru; kode akses salah ditolak.
- [ ] Matikan internet atau ubah URL: pesan error muncul dan tombol "Coba lagi" bekerja.
- [ ] Tampilan benar di ponsel, tablet, desktop; menu hamburger dan navigasi keyboard berfungsi.
