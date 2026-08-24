# WeddingApp — Analisis Fitur & Bug

## 📋 Fitur yang Sudah Ada (Implemented)

### CMS Admin Panel
- ✅ Login/Logout autentikasi
- ✅ Dashboard admin (stat cards, visitor chart, RSVP summary, activity log)
- ✅ Template CRUD (Create, Edit, Index, DeveloperStatus)
- ✅ Users CRUD (Index, Create, Edit)
- ✅ Roles CRUD (Index, Create, Edit)
- ✅ ACL (Access Control List) management
- ✅ Wedding Registry (multi-tenant: create/delete slug-based weddings)

### CMS — Wedding Editor (per-slug)
- ✅ Pesan WhatsApp (Generate Text)
- ✅ Tema/Template pilihan
- ✅ RSVP Online management
- ✅ Informasi Acara (events CRUD)
- ✅ Love Story
- ✅ Manajemen Tamu
- ✅ Amplop Digital
- ✅ Galeri
- ✅ Countdown
- ✅ QR Check-in
- ✅ Live Streaming settings
- ✅ Ucapan & Doa
- ✅ Wishlist

### Public Invitation (SPA)
- ✅ Dynamic template loading (14 Nusantara-themed templates + universal)
- ✅ Cover section with guest name personalization
- ✅ Couple section
- ✅ Event section with map
- ✅ Countdown section
- ✅ Gallery section (masonry/slider/grid)
- ✅ Music player (floating button)
- ✅ RSVP form
- ✅ Wishes section
- ✅ Gift section (bank, QRIS)
- ✅ Password protection gate
- ✅ SEO meta tags (Open Graph)
- ✅ Demo mode (slug starts with `demo-`)

### API Endpoints
- ✅ Full CRUD for couples, events, guests, media, payments, RSVP, wishes, settings
- ✅ Public endpoints for invitation viewing
- ✅ Protected endpoints for CMS management

---

## ❌ Fitur yang Belum Lengkap / Missing Features

### 1. **Love Story Section di Invitation (Guest-Facing)**
- Data `love_story` sudah ada di settings tapi **tidak ada section `LoveStorySection.vue`** di `resources/js/Pages/Landing/invitation/sections/`
- Di CMS sudah bisa input love story, tapi tamu **tidak bisa melihatnya** di undangan publik

### 2. **Wishlist Section di Invitation (Guest-Facing)**
- Data `wishlist_items` ada di settings dan CMS sudah ada form, tapi **tidak ada `WishlistSection.vue`** di invitation sections
- Tamu tidak bisa lihat wishlist registry

### 3. **Health Protocol Display di Invitation**
- Field `health_protocol` ada di settings, tapi tidak di-render di invitation sections
- Seharusnya ditampilkan ke tamu jika diisi

### 4. **Streaming URL di Invitation**
- `live_stream_url` sudah ada di settings, tapi **tidak ada section streaming** di invitation publik

### 5. **Custom Domain Feature**
- Field `custom_domain` ada di settings tapi belum ada implementasi routing/proxy untuk custom domain

### 6. **Whitelabel Watermark Toggle**
- Field `show_watermark` ada di settings tapi **tidak ada watermark** yang di-render di `InvitationLayout.vue`

### 7. **Excel Import/Export Tamu — Belum Terintegrasi ke Backend**
- Komponen `ImportExport.vue` ada tapi data tamu disimpan via API individual, belum ada endpoint batch import Excel

### 8. **PDF Export RSVP**
- Komponen `RsvpExporter.vue` ada tapi hanya frontend-only, belum ada backend PDF generation

### 9. **Property Tests (Optional Tasks)**
- Semua property tests dari task plan ditandai `[ ]*` (optional) dan **belum diimplementasi**:
  - Serialization round-trip tests
  - CRUD consistency tests
  - Validation property tests
  - URL encoding round-trip tests
  - QR code encode/decode tests
  - Countdown calculation tests
  - etc.

### 10. **Couple Photo Upload — Tidak Ada di API**
- `CoupleApiController::store()` hanya menerima string URL untuk `groom.photo` dan `bride.photo`
- **Tidak ada endpoint upload file** untuk foto couple (harus upload manual ke storage dulu)

### 11. **Media Order/Reorder**
- `MediaApiController` hanya punya `store` dan `destroy`, **tidak ada reorder endpoint**
- Di frontend `MediaGrid.vue` ada drag-to-reorder tapi tidak persistent ke backend

### 12. **Guest Batch Import Endpoint**
- Ada `POST /api/wedding/{slug}/guests/batch` di route tapi perlu validasi apakah controller implementation lengkap

---

## 🐛 Potential Bugs

### Bug 1: Demo Data — Groom/Bride Terbalik
**File:** `CoupleApiController.php` line 22-40
- `groom` field berisi data `Rita` (nama perempuan) dan `bride` berisi `Reza` (nama laki-laki)
- Label `fatherName` di groom juga `Capulet` (biasanya bride) dan bride pakai `Montague`
- **Impact:** Demo preview menampilkan data mempelai terbalik

### Bug 2: InvitationView — Memakai localStorage Service di Frontend SPA
**File:** `resources/js/Pages/Landing/invitation/views/InvitationView.vue`
- Import `coupleService`, `eventService`, `settingsService`, `mediaService` dari `@/api/services/` 
- Service ini menggunakan **localStorage**, bukan API call ke backend
- `weddingRegistryService.exists(slug)` juga pakai localStorage
- **Impact:** Invitation publik tidak bisa tampil karena localStorage kosong di browser tamu!
- **Root Cause:** Hybrid architecture — CMS pakai Inertia tapi Invitation pakai SPA dengan localStorage services
- Seharusnya untuk guest-facing invitation, data harus di-fetch dari API backend (`/api/wedding/{slug}/couple`, etc.)

### Bug 3: Vite Proxy Incomplete
**File:** `vite.config.js`
- Proxy hanya untuk `/api`, `/login`, `/logout`, `/cms/dashboard`
- **Tidak ada proxy untuk `/wedding/{slug}`** — SPA route ini akan 404 saat di-serve dari Vite dev server
- Route `/cms/{slug}/undangan/*` juga tidak di-proxy

### Bug 4: Wedding Table — user_id Column Mungkin Belum Ada
**File:** `database/migrations/2026_06_02_000000_create_wedding_tables.php`
- Schema `weddings` hanya punya `id`, `slug`, `label`, `timestamps` 
- Tapi `Wedding` model punya `'user_id'` di fillable dan `WeddingEditorController` pakai `->where('user_id', $user->id)`
- **Kemungkinan ada migration terpisah** (`2026_06_02_103515_add_user_id_and_create_custom_templates.php`) tapi perlu dicek

### Bug 5: Settings — Missing `font_family` in formatSetting Response
**File:** `SettingApiController.php`
- Demo response mengembalikan hardcoded `fontFamily` per template
- Tapi `formatSetting()` untuk real data **tidak mengembalikan `fontFamily`** 
- Template rendering mungkin memerlukan font family tapi tidak tersedia dari API

### Bug 6: Event Model — Missing `dress_code` in API Response
**File:** `EventApiController.php` (perlu dicek)
- Migration menambahkan `dress_code` column tapi kemungkinan API response belum include field ini

### Bug 7: Database SQLite — Empty File
**File:** `database/database.sqlite` — 0 bytes
- Database file kosong, artinya migration belum dijalankan atau di-reset
- Perlu `php artisan migrate` dan `php artisan db:seed`

### Bug 8: Wishes Relationship — Undefined in WeddingEditorController
**File:** `WeddingEditorController.php` line 135
- `$wedding->wishes` di-pass ke view tapi `Wedding::with()` hanya loads `['couple', 'events', 'guests', 'rsvps', 'media']`
- Relationship `wishes` **tidak di-eager load** sehingga akan trigger N+1 query atau null

### Bug 9: Stale Temp Files
- `temp_recreate_cms.php` dan `temp_restore_cms.php` ada di root project — kemungkinan development artifacts yang bisa jadi security risk

### Bug 10: `.DS_Store` dan `grep.exe.stackdump` Committed
- macOS `.DS_Store` files ada di `resources/js/`, `resources/js/Pages/Cms/`, `public/assets/`
- `grep.exe.stackdump` di root dan `resources/js/` — development crash dumps
- Seharusnya masuk `.gitignore`

---

## ⚠️ Saran Prioritas Perbaikan

1. **CRITICAL:** Fix Bug 2 — Invitation publik harus fetch dari API, bukan localStorage
2. **HIGH:** Fix Bug 1 — Demo data groom/bride terbalik
3. **HIGH:** Tambah Love Story & Wishlist sections di invitation publik
4. **MEDIUM:** Fix Bug 8 — Eager load wishes relationship
5. **MEDIUM:** Tambah font_family ke API response settings
6. **LOW:** Clean up temp files dan .DS_Store
