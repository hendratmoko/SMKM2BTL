
# DOCUMENTATION
berikut link dokumentasi yang saya buat di google dokumen.
https://docs.google.com/document/d/1z8TsJ4dwM_vM7CrQD1zn1YP1EausjAPSBrIDUJVqSy4/edit?usp=sharing


## Deskripsi Sistem

Sistem ini digunakan untuk mengelola peminjaman alat secara online berbasis Laravel.

---

## Alur Sistem

1.Registrasi & Login
    
2.Peminjaman Alat

-User memilih alat/produk yang ingin dipinjam.

-User melakukan pembayaran deposit awal sesuai syarat peminjaman.


3.Persetujuan Peminjaman oleh Petugas

-Petugas memverifikasi pengajuan peminjaman.


4.Proses Pengiriman oleh Petugas

-Petugas menyiapkan barang dan melakukan pengiriman ke user.


5.User menerima barang dan mengonfirmasi penerimaan.

6.User menggunakan alat sesuai durasi peminjaman.

7.Proses Pengembalian

-Setelah masa peminjaman selesai, user membuat request pengembalian.


8.Pengecekan Barang oleh Petugas

-Petugas menerima barang dan memeriksa kondisi.


9.Pembayaran Total & Selesai

-User membayar total biaya ( biaya sewa - deposit + denda(jika ada) ).


10.Selesai Proses Peminjaman

---

## Fitur Sistem

### Autentikasi
- Register
- Login
- Logout

### Peminjaman
- Melihat daftar alat
- Detail alat
- Melakukan peminjaman

### Manajemen
- Dashboard Admin
- Dashboard Petugas
- Dashboard User
- Manajemen peminjaman
- Manajemen Pengembalian
- Manajemen Pembayaran

---

## Struktur Database

Database terdiri dari beberapa tabel utama sebagai berikut:

-users

-categories

-produks

-transaksis

-detail_transaksis

-pengirimans

-pengembalians

-pembayarans

-activity_logs


### Tabel users

Tabel users digunakan untuk menyimpan data pengguna sistem seperti admin, petugas, dan user.

| Field             | Tipe      | Keterangan                       |
| ----------------- | --------- | -------------------------------- |
| id                | bigint    | Primary key                      |
| name              | string    | Nama pengguna                    |
| email             | string    | Email pengguna (unik)            |
| email_verified_at | timestamp | Verifikasi email                 |
| password          | string    | Password pengguna                |
| level             | enum      | Hak akses (admin, petugas, user) |
| foto              | text      | Foto profil pengguna             |
| alamat            | text      | Alamat pengguna                  |
| nomor_hp          | string    | Nomor telepon pengguna           |
| last_seen         | timestamp | Waktu terakhir aktif             |
| remember_token    | string    | Token login                      |
| created_at        | timestamp | Waktu dibuat                     |
| updated_at        | timestamp | Waktu diubah                     |
| deleted_at        | timestamp | Soft delete                      |


### Tabel categories

Tabel categories digunakan untuk menyimpan data kategori alat atau produk.
| Field              | Tipe      | Keterangan           |
| ------------------ | --------- | -------------------- |
| id                 | bigint    | Primary key          |
| kode_kategori      | string    | Kode kategori (unik) |
| nama_kategori      | string    | Nama kategori        |
| deskripsi_kategori | text      | Deskripsi kategori   |
| slug               | string    | URL slug kategori    |
| image              | string    | Gambar kategori      |
| created_at         | timestamp | Waktu dibuat         |
| updated_at         | timestamp | Waktu diubah         |
| deleted_at         | timestamp | Soft delete          |


### Tabel produks

Tabel produks digunakan untuk menyimpan data alat yang dapat dipinjam.
| Field       | Tipe        | Keterangan                        |
| ----------- | ----------- | --------------------------------- |
| id          | bigint      | Primary key                       |
| category_id | foreign key | Relasi ke tabel categories        |
| kode_produk | string      | Kode produk unik                  |
| nama_produk | string      | Nama produk                       |
| deskripsi   | text        | Deskripsi produk                  |
| stok        | integer     | Jumlah stok tersedia              |
| harga       | decimal     | Harga sewa per hari               |
| kondisi     | string      | Kondisi produk                    |
| fitur       | string      | Fitur tambahan                    |
| status      | enum        | Status produk (tersedia/dipinjam) |
| gambar      | string      | Gambar produk                     |
| created_at  | timestamp   | Waktu dibuat                      |
| updated_at  | timestamp   | Waktu diubah                      |
| deleted_at  | timestamp   | Soft delete                       |


### Tabel transaksis

Tabel transaksis digunakan untuk menyimpan data utama peminjaman alat.
| Field              | Tipe        | Keterangan                 |
| ------------------ | ----------- | -------------------------- |
| id                 | bigint      | Primary key                |
| pengembalian_id    | foreign key | Relasi ke pengembalians    |
| user_id            | foreign key | Relasi ke users            |
| kode_transaksi     | string      | Kode transaksi unik        |
| nama_lengkap       | string      | Nama peminjam              |
| email              | string      | Email peminjam             |
| no_telepon         | string      | Nomor telepon              |
| no_identitas       | string      | Nomor KTP                  |
| foto_ktp           | string      | Foto KTP                   |
| provinsi           | string      | Provinsi alamat            |
| kabupaten          | string      | Kabupaten                  |
| kecamatan          | string      | Kecamatan                  |
| kelurahan          | string      | Kelurahan                  |
| alamat_lengkap     | text        | Alamat lengkap             |
| bukti_deposit      | string      | Bukti pembayaran deposit   |
| jumlah_deposit     | decimal     | Nominal deposit            |
| metode_pembayaran  | string      | Metode pembayaran          |
| tanggal_pengajuan  | timestamp   | Tanggal pengajuan          |
| status             | enum        | Status transaksi           |
| catatan_verifikasi | text        | Catatan petugas            |
| verified_by        | foreign key | Petugas yang memverifikasi |
| tanggal_verifikasi | timestamp   | Waktu verifikasi           |
| created_at         | timestamp   | Waktu dibuat               |
| updated_at         | timestamp   | Waktu diubah               |
| deleted_at         | timestamp   | Soft delete                |

Status Transaksi:

-menunggu_persetujuan

-disetujui

-ditolak

-dikirim

-dipinjam

-dikembalikan

-selesai

-dibatalkan


### Tabel detail_transaksis

Tabel detail_transaksis digunakan untuk menyimpan detail produk dalam setiap transaksi.
| Field           | Tipe        | Keterangan           |
| --------------- | ----------- | -------------------- |
| id              | bigint      | Primary key          |
| transaksi_id    | foreign key | Relasi ke transaksis |
| produk_id       | foreign key | Relasi ke produks    |
| nama_produk     | string      | Snapshot nama produk |
| harga_per_hari  | decimal     | Harga saat transaksi |
| jumlah          | integer     | Jumlah produk        |
| durasi_hari     | integer     | Lama pinjam          |
| tanggal_mulai   | date        | Tanggal mulai        |
| tanggal_selesai | date        | Tanggal selesai      |
| subtotal        | decimal     | Total harga produk   |
| created_at      | timestamp   | Waktu dibuat         |
| updated_at      | timestamp   | Waktu diubah         |
| deleted_at      | timestamp   | Soft delete          |


### Tabel pengirimans

Tabel pengirimans digunakan untuk mencatat proses pengiriman barang kepada peminjam.
| Field               | Tipe        | Keterangan           |
| ------------------- | ----------- | -------------------- |
| id                  | bigint      | Primary key          |
| transaksi_id        | foreign key | Relasi ke transaksis |
| petugas_id          | foreign key | Petugas pengirim     |
| foto_barang_dikirim | string      | Foto saat dikirim    |
| foto_barang_sampai  | string      | Foto saat diterima   |
| catatan_pengiriman  | text        | Catatan pengiriman   |
| catatan_penerimaan  | text        | Catatan penerimaan   |
| tanggal_dikirim     | timestamp   | Waktu kirim          |
| tanggal_sampai      | timestamp   | Waktu sampai         |
| created_at          | timestamp   | Waktu dibuat         |
| updated_at          | timestamp   | Waktu diubah         |
| deleted_at          | timestamp   | Soft delete          |


### Tabel pengembalians

Tabel pengembalians digunakan untuk mencatat proses pengembalian barang.
| Field                      | Tipe        | Keterangan            |
| -------------------------- | ----------- | --------------------- |
| id                         | bigint      | Primary key           |
| transaksi_id               | foreign key | Relasi ke transaksis  |
| user_id                    | foreign key | User pengembali       |
| petugas_id                 | foreign key | Petugas pemeriksa     |
| status                     | enum        | Status pengembalian   |
| no_resi_pengembalian       | string      | Nomor resi            |
| kurir_pengembalian         | string      | Kurir                 |
| tanggal_dikirim            | timestamp   | Tanggal kirim         |
| tanggal_sampai             | timestamp   | Tanggal sampai        |
| foto_barang_dikembalikan   | string      | Foto barang           |
| catatan_user               | text        | Catatan user          |
| foto_barang_setelah_sampai | string      | Foto setelah diterima |
| kondisi_barang             | enum        | Kondisi barang        |
| deskripsi_kerusakan        | text        | Deskripsi kerusakan   |
| biaya_kerusakan            | decimal     | Biaya kerusakan       |
| catatan_petugas            | text        | Catatan petugas       |
| denda_keterlambatan        | decimal     | Denda keterlambatan   |
| total_biaya_tambahan       | decimal     | Total biaya tambahan  |
| created_at                 | timestamp   | Waktu dibuat          |
| updated_at                 | timestamp   | Waktu diubah          |
| deleted_at                 | timestamp   | Soft delete           |

Status Pengembalian:

-menunggu_pengiriman

-dikirim

-sampai

-diproses

-selesai

-dibatalkan


### Tabel activity_logs

Tabel activity_logs digunakan untuk mencatat aktivitas pengguna dalam sistem.
| Field         | Tipe        | Keterangan          |
| ------------- | ----------- | ------------------- |
| id            | bigint      | Primary key         |
| user_id       | foreign key | ID pengguna         |
| user_name     | string      | Nama pengguna       |
| user_email    | string      | Email pengguna      |
| user_level    | string      | Level pengguna      |
| action        | string      | Jenis aktivitas     |
| module        | string      | Modul sistem        |
| item_id       | string      | ID data             |
| item_code     | string      | Kode data           |
| description   | text        | Deskripsi aktivitas |
| old_data      | json        | Data lama           |
| new_data      | json        | Data baru           |
| ip_address    | string      | IP address          |
| user_agent    | text        | Browser             |
| status        | string      | Status aktivitas    |
| error_message | text        | Pesan error         |
| created_at    | timestamp   | Waktu aktivitas     |

---

##Relasi Antar Tabel

1.users → transaksis (one-to-many)

2.categories → produks (one-to-many)

3.produks → detail_transaksis (one-to-many)

4.transaksis → detail_transaksis (one-to-many)

5.transaksis → pengirimans (one-to-one)

6.transaksis → pengembalians (one-to-one)

7.users → pengirimans (one-to-many)

8.users → pengembalians (one-to-many)

---

## Teknologi

- Laravel
- MySQL
- Bootstrap
- JavaScript
