# LHK PWA untuk GitHub + Cloudflare Pages

Paket ini memindahkan **frontend** aplikasi LHK ke **Cloudflare Pages** dan tetap memakai **Google Apps Script** sebagai backend/API.

## Yang berubah
Frontend sekarang:
- menjadi **PWA** (installable di HP/desktop)
- di-host di **Cloudflare Pages**
- memanggil Apps Script lewat **Cloudflare Pages Functions** pada route `/api/*`

Backend tetap:
- `Code.gs`
- `Report.html`
- `appsscript.json`

## Struktur file
- `index.html` → frontend PWA
- `manifest.webmanifest` → manifest PWA
- `sw.js` → service worker
- `icons/` → icon PWA
- `functions/api/[api].js` → proxy Cloudflare ke Apps Script
- `_headers` → header cache dasar
- `wrangler.toml` → config minimal
- `README.md` → panduan ini

---

## A. Deploy backend Google Apps Script

### 1) Buat project Apps Script
Upload file berikut ke project Apps Script:
- `Code.gs`
- `Report.html`
- `appsscript.json`

### 2) Deploy sebagai Web App
Di Apps Script:
- **Deploy**
- **New deployment**
- type: **Web app**
- Execute as: **User deploying**
- Who has access: **Anyone**

Lalu copy URL Web App, contohnya:
`https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec`

Itu nanti dipakai di Cloudflare sebagai `GAS_WEBAPP_URL`.

### 3) Authorize
Jalankan sekali:
- `setupAuto()`
- `bootstrapCreateFirstAdminAuto()`

Lalu authorize semua permission yang diminta.

> Catatan:
> - untuk mode Cloudflare ini, backend Apps Script tetap dipakai
> - file upload PDF, export PDF, export Excel, login, admin, semua tetap lewat backend Apps Script

---

## B. Upload project ini ke GitHub

### Cara cepat
1. Buat repo baru di GitHub, misalnya `lhk-pwa`
2. Upload semua isi folder ini ke root repo
3. Commit dan push

Atau via git:

```bash
git init
git add .
git commit -m "Initial LHK PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/lhk-pwa.git
git push -u origin main
```

---

## C. Deploy ke Cloudflare Pages

### 1) Masuk Cloudflare Pages
- Login ke Cloudflare
- Buka **Workers & Pages**
- **Create**
- **Pages**
- **Connect to Git**

### 2) Pilih repo GitHub
Pilih repo `lhk-pwa` tadi.

### 3) Build settings
Karena ini project statis + Pages Functions, set seperti ini:
- Framework preset: **None**
- Build command: kosong
- Build output directory: `.`

### 4) Tambah Environment Variable
Di Cloudflare Pages project settings, tambahkan:

- Key: `GAS_WEBAPP_URL`
- Value: URL deploy Apps Script Web App kamu

Contoh:
`https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec`

### 5) Deploy
Klik deploy.

---

## D. Supaya bisa di-install sebagai PWA
Setelah site Cloudflare aktif:
- buka URL project
- di Chrome/Edge akan muncul opsi **Install App**
- di Android bisa **Add to Home Screen**

PWA aktif karena file ini sudah disiapkan:
- `manifest.webmanifest`
- `sw.js`
- icon 192 dan 512

---

## E. Alur arsitektur

Browser user:
- buka frontend di Cloudflare Pages

Frontend:
- memanggil `/api/login`, `/api/exportPdf`, dll

Cloudflare Pages Function:
- meneruskan request ke Apps Script Web App

Apps Script:
- proses logic
- akses Spreadsheet/Drive/Mail
- kirim JSON balik

---

## F. File Apps Script yang tetap dipakai

### 1) `Code.gs`
Tetap dipakai.
Tidak perlu diubah besar-besaran untuk mode ini, karena frontend Cloudflare memanggil endpoint:
- `login`
- `getSession`
- `renderPreviewHtml`
- `exportPdf`
- `exportExcel`
- dst

### 2) `Report.html`
Tetap dipakai.
Preview dan print masih dirender dari backend.

### 3) `appsscript.json`
Tetap dipakai.
Scope yang sekarang sudah cocok untuk:
- Drive
- Spreadsheet
- Mail
- external request
- storage

---

## G. Hal penting yang perlu kamu tahu

### 1) CORS
Project ini **tidak bergantung pada CORS browser langsung ke Apps Script**, karena request lewat Cloudflare Function dulu.

### 2) URL backend wajib diisi
Kalau `GAS_WEBAPP_URL` belum diisi, frontend akan gagal bekerja.

### 3) Preview tetap server-rendered
Preview HTML masih berasal dari Apps Script `renderPreviewHtml`.

### 4) Upload file PDF tetap ke backend
Base64 file dikirim ke Cloudflare Function lalu diteruskan ke Apps Script.

### 5) Session token
Token masih memakai mekanisme backend kamu sekarang.

---

## H. Testing setelah deploy

Coba urutan ini:
1. buka site Cloudflare
2. login admin pertama
3. cek tab admin muncul
4. generate preview
5. download PDF
6. download Excel
7. save/load draft
8. upload PDF
9. cek admin inbox

Kalau login gagal:
- pastikan `setupAuto()` dan `bootstrapCreateFirstAdminAuto()` sudah dijalankan
- pastikan Web App Apps Script sudah di-deploy ulang versi terbaru
- pastikan `GAS_WEBAPP_URL` di Cloudflare benar

---

## I. Re-deploy jika backend berubah
Kalau kamu mengubah `Code.gs` atau `Report.html`:
- **Deploy new version** di Apps Script
- jika URL Web App berubah, update `GAS_WEBAPP_URL` di Cloudflare

Kalau hanya frontend berubah:
- push commit baru ke GitHub
- Cloudflare Pages akan deploy ulang otomatis

---

## J. Rekomendasi lanjutan
Tahap berikut yang bagus:
- pindahkan icon ke branding resmi instansi
- tambah splash screen/shortcut PWA
- tambah mode offline basic untuk halaman login
- tambah custom domain Cloudflare
- harden security response header
- buat halaman `offline.html`

---

## K. Checklist final
- [ ] Apps Script file sudah masuk
- [ ] Web App sudah deploy
- [ ] `setupAuto()` sudah dijalankan
- [ ] `bootstrapCreateFirstAdminAuto()` sudah dijalankan
- [ ] Repo GitHub sudah terisi file PWA ini
- [ ] Cloudflare Pages sudah connect ke repo
- [ ] env `GAS_WEBAPP_URL` sudah diisi
- [ ] deploy Cloudflare berhasil
- [ ] login, preview, PDF, Excel, upload, admin sudah dites

