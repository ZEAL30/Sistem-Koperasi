# Product Requirements Document (PRD) & Project Brief: Smart Koperasi

**Versi Dokumen:** 1.0.0  
**Status:** Approved & Living Document  
**Tanggal:** 2025  
**Klasifikasi:** Internal / Core Specification Document  

---

## 1. Executive Summary & Project Brief

### 1.1 Visi & Latar Belakang
**Smart Koperasi** adalah platform digitalisasi koperasi modern berbasis web enterprise yang mengintegrasikan layanan simpan pinjam, buku kas digital, pembagian Sisa Hasil Usaha (SHU), serta sistem tata kelola otentikasi bertingkat (*Role-Based Access Control*). 

Proyek ini dibangun untuk mengatasi kendala konvensional operasional koperasi:
- **Pencatatan Manual & Terfragmentasi:** Menghapus ketergantungan pada buku fisik atau spreadsheet terpisah yang rentan terhadap manipulasi dan *human error*.
- **Asimetri Informasi & Transparansi:** Menyediakan visibilitas saldo simpanan, plafon pinjaman, dan proyeksi dividen SHU secara *real-time* kepada anggota.
- **Birokrasi Lambat:** Memangkas durasi pengajuan dan persetujuan pinjaman melalui sistem kalkulator simulasi instan serta alur persetujuan berbasis tata kelola (*compliance check*).

### 1.2 Struktur Tim & Kepemilikan Produk
| Peran | Nama Personel | Tanggung Jawab Utama |
| :--- | :--- | :--- |
| **Project Leader** | Rayhan Setya Dwi Putranto | Koordinasi timeline, alokasi sumber daya, kepatuhan roadmap, dan persetujuan deliverables. |
| **Frontend Developer** | Fauzan Mukhlish | Implementasi Web UI/UX, slicing komponen antarmuka, konsistensi token desain, dan integrasi API client. |
| **Backend Developer** | Ghania Syafika | Arsitektur database, REST API, sistem otentikasi (JWT/RBAC), enkripsi data, dan kalkulasi finansial. |
| **Quality Assurance (QA)** | Fitri Choirun Nisa | Pengujian fungsionalitas, unit & end-to-end testing, validasi keamanan login & formulir, serta verifikasi regresi UI. |

---

## 2. Tujuan Bisnis & Key Results (OKRs)

### Objective 1: Menghadirkan Ekosistem Koperasi Digital yang Transparan dan Real-Time
- **KR 1.1:** 100% saldo simpanan (pokok, wajib, sukarela) dan buku kas anggota terupdate seketika (*real-time mutation*).
- **KR 1.2:** Menghilangkan disparitas pencatatan manual hingga tingkat kesalahan 0%.

### Objective 2: Mempercepat Siklus Pengajuan & Manajemen Pinjaman
- **KR 2.1:** Pemrosesan simulasi pinjaman instan (< 1 detik kalkulasi plafon, bunga, dan angsuran bulanan).
- **KR 2.2:** Memangkas *turnaround time* pengajuan pinjaman dari rata-rata 3-5 hari kerja menjadi di bawah 24 jam.

### Objective 3: Keandalan Keamanan, Kepatuhan Regulasi, dan Aksesibilitas
- **KR 3.1:** Implementasi arsitektur keamanan Zero-Trust dengan autentikasi dua arah (OTP + JWT) dan enkripsi 256-bit.
- **KR 3.2:** Keselarasan 100% dengan regulasi Kemenkop UKM dan prinsip kehati-hatian finansial OJK.

---

## 3. Profil Pengguna (User Personas & Role Matrix)

### 3.1 Personas
1. **Anggota Koperasi (Primary User - Member):**
   - *Karakteristik:* Anggota aktif yang menabung rutin dan sewaktu-waktu membutuhkan pinjaman lunak, serta memantau akumulasi dividen SHU tahunan.
   - *Kebutuhan:* Akses ringkas, ringkasan saldo cepat, riwayat mutasi transparan, dan simulasi pinjaman yang jelas tanpa biaya terselubung.
2. **Pengurus / Pengelola Koperasi (Admin/Officer):**
   - *Karakteristik:* Tim operasional yang memverifikasi data anggota, menganalisis kelayakan kredit, serta menyusun buku kas dan neraca keuangan.
   - *Kebutuhan:* Kontrol modul CRUD yang aman, audit trail lengkap, dan dashboard analitik terpadu.

### 3.2 Role-Based Access Control (RBAC) Matrix
| Modul / Fitur | Anggota (Member) | Pengurus (Admin / Officer) | Publik (Guest) |
| :--- | :---: | :---: | :---: |
| Halaman Login & Registrasi | Akses | Akses | Akses |
| Lupa Password & Verifikasi OTP | Akses | Akses | Akses |
| Dashboard Ringkasan Portofolio | Akses (Data Pribadi) | Akses (Agregat Koperasi) | Dibatasi |
| Portal Simpanan & Mutasi | Akses (Data Pribadi) | Akses Penuh (Semua Anggota) | Dibatasi |
| Simulasi & Pengajuan Pinjaman | Akses (Formulir & CRUD pribadi) | Akses Persetujuan / CRUD | Dibatasi |
| Buku Kas Anggota | Akses (Arus Kas Personal) | Akses (Jurnal Umum Koperasi) | Dibatasi |
| Laporan & Pembagian SHU | Akses (Estimasi Dividen) | Akses (Kalkulasi & Distribusi) | Dibatasi |

---

## 4. Arsitektur Sistem & Spesifikasi Modul Fungsional

### 4.1 Modul 1: Autentikasi & Manajemen Sesi (Security & Auth)
- **Halaman Login Terpadu:**
  - Pilihan role: *Anggota* vs *Pengurus / Admin*.
  - Autentikasi via Email / Nomor Anggota dan Kata Sandi dengan *show/hide password toggle*.
  - Brute-force rate limiting: Kunci akun otomatis setelah 5 kali kegagalan input berurutan.
- **Pendaftaran Akun Baru (Register):**
  - Input: Nama Lengkap (KTP), NIK (16 digit), Email, No. WhatsApp, Password berindikator kekuatan (*Password Strength Indicator*).
  - Verifikasi syarat & ketentuan kepatuhan perkoperasian.
  - Akun baru berstatus *Pending Approval* sebelum diverifikasi verifikator internal.
- **Alur Pemulihan Akun 3-Langkah (Password Recovery):**
  - *Langkah 1 (Identifikasi):* Input email terdaftar dengan pengiriman tautan/kode OTP.
  - *Langkah 2 (Verifikasi OTP):* Input 6 digit token dengan countdown timer 60 detik & fitur kirim ulang.
  - *Langkah 3 (Reset Password):* Input kata sandi baru dengan standar minimal 8 karakter, kombinasi simbol & angka.
- **Manajemen Sesi & Logout Aman:**
  - Token berbasis JSON Web Token (JWT) dengan *sliding expiration*.
  - Modal konfirmasi logout bertingkat dengan pembersihan token dari memori lokal dan server-side blacklisting.

### 4.2 Modul 2: Dashboard Ringkasan (Member Overview)
- **Kartu Metrik Finansial:**
  - Total Saldo Simpanan (Pokok, Wajib, Sukarela).
  - Sisa Pokok Pinjaman Aktif & Jatuh Tempo Angsuran Terdekat.
  - Estimasi Sisa Hasil Usaha (SHU) Berjalan.
- **Aksi Cepat:** Setor Simpanan, Ajukan Pinjaman Cepat, Unduh E-Statement Bulanan.
- **Feed Aktivitas Terakhir:** Mutasi kas dan status verifikasi permohonan terkini.

### 4.3 Modul 3: Portal Simpanan Anggota
- **Klasifikasi Simpanan:**
  - *Simpanan Pokok:* Nilai baku keanggotaan awal.
  - *Simpanan Wajib:* Penyetoran rutin bulanan dengan tracker kepatuhan pembayaran.
  - *Simpanan Sukarela:* Saldo likuid yang dapat ditarik sewaktu-waktu.
- **Riwayat Mutasi & Filter:** Filter berdasarkan periode (bulan/tahun), jenis transaksi (debit/kredit), dan status approval.

### 4.4 Modul 4: Modul Pinjaman & Manajemen Portofolio (CRUD Pinjaman)
- **Kalkulator Simulasi Pinjaman Interaktif:**
  - Input jumlah plafon pinjaman dan tenor (jangka waktu dalam bulan).
  - Perhitungan otomatis skema bunga transparan (Flat / Menurun), total pengembalian, dan nominal angsuran per bulan.
- **Kartu Ringkasan Plafon & Syarat Ringkas:**
  - Indikator limit plafon yang disetujui (misal: Rp 50.000.000).
  - Preview checklist syarat pengajuan (keaktifan minimal 3 bulan, KTP/slip gaji, skor kredit Prima A+, jaminan sesuai ambang batas).
- **CRUD Pinjaman Portofolio:**
  - *Create:* Pengajuan pinjaman baru beserta unggah dokumen pendukung.
  - *Read:* Daftar pinjaman aktif, jadwal angsuran, sisa pokok, dan riwayat pembayaran.
  - *Update:* Pengajuan penyesuaian tenor atau restrukturisasi pinjaman.
  - *Delete/Cancel:* Pembatalan draf pengajuan pinjaman yang belum diproses oleh tim analis.

### 4.5 Modul 5: Buku Kas Digital Anggota
- **Pencatatan Arus Kas Transparan:**
  - Rekapitulasi uang masuk (setoran simpanan, pencairan pinjaman, deviden SHU).
  - Rekapitulasi uang keluar (pembayaran angsuran, penarikan simpanan sukarela).
- **Fitur Ekspor & Audit:** Unduh mutasi kas format PDF & Excel berstandar akuntansi.

### 4.6 Modul 6: Sisa Hasil Usaha (SHU)
- **Transparansi Perhitungan SHU:**
  - Komponen Jasa Modal (berdasarkan porsi simpanan anggota terhadap total modal koperasi).
  - Komponen Jasa Usaha/Anggota (berdasarkan volume transaksi pinjaman dan aktivitas anggota).
- **Proyeksi Pembagian:** Simulasi nominal penerimaan SHU pada Rapat Anggota Tahunan (RAT).

---

## 5. Non-Functional Requirements (NFR)

| Kategori | Spesifikasi Standar |
| :--- | :--- |
| **Performance** | Waktu muat awal (*First Contentful Paint*) < 1.2 detik pada koneksi standar broadband; response time API < 300 ms. |
| **Security** | HTTPS/TLS 1.3, Hashing kata sandi menggunakan Argon2id / BCrypt (salt round 12), Enkripsi AES-256 untuk data finansial sensitif. |
| **Reliability & Uptime** | Ketersediaan layanan minimal 99.9% uptime per bulan. Backup database snapshot setiap 6 jam. |
| **Usability & UX** | Format tipografi moneter yang jelas (`Rp [Nominal]`), navbar tetap tanpa flickering, desain ramah keyboard (*accessible tab order*). |
| **Compliance** | Sesuai Standar Akuntansi Keuangan Entitas Tanpa Akuntabilitas Publik (SAK ETAP) untuk Koperasi & regulasi Permenkop UKM. |

---

## 6. Design System & Frontend Architecture

- **Pondasi Desain:** *Smart Koperasi Design System* (Plus Jakarta Sans, Rounded-md).
- **Palet Warna Inti:**
  - *Primary (Finansial & Kepercayaan):* Deep Emerald Green (`#0F5A47`)
  - *Secondary / Accent (Kemakmuran):* Warm Gold (`#F4B400`)
  - *Neutral Surface:* Pure White (`#FFFFFF`) & Slate Container (`#F8FAFC`, `#F2F4F6`)
  - *Typography Base:* Charcoal Dark (`#1E293B`) untuk kontras terbaca optimal
- **Navigasi Konsisten (App Shell Architecture):**
  - Ketinggian baku `h-16` (64px) dengan batas bawah halus (*subtle border*).
  - Garis indikator aktif (*green bottom indicator*) presisi pada tab aktif (**Ringkasan**, **Simpanan**, **Pinjaman**, **Buku Kas**, **SHU**).
  - Area utilitas seragam: Badge status keanggotaan, lonceng notifikasi dot, avatar profil, ID anggota, dan quick logout.

---

## 7. Roadmap & Fase Rilis (Milestones)

```
[ Phase 1: Inisiasi, Auth & Desain Web ] ──► [ Phase 2: Core Member & CRUD Pinjaman ]
                                                              │
[ Phase 4: Production Launch & Training ] ◄── [ Phase 3: Buku Kas, SHU & QA Testing ]
```

1. **Sprint 1 (Fondasi & Keamanan):** Desain UI, Database Schema, Autentikasi Lengkap (Login, Register, 3-Step Recovery).
2. **Sprint 2 (Finansial Inti):** Dashboard Anggota, Portal Simpanan, dan Modul Simulasi/CRUD Pinjaman Anggota.
3. **Sprint 3 (Akuntansi & Transparansi):** Buku Kas Digital, Kalkulasi Otomatis SHU, dan Pengujian End-to-End oleh QA.
4. **Sprint 4 (Deployment & UAT):** User Acceptance Test bersama pengurus, audit kepatuhan, dan peluncuran resmi.
