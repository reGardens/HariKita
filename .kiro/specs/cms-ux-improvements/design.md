# Technical Design Document — CMS UX Improvements

## 1. Architecture Overview

### Current Architecture

The WeddingApp uses a **hybrid rendering model**:

| Route Pattern                                | Renderer              | Framework                                      |
| -------------------------------------------- | --------------------- | ---------------------------------------------- |
| `/login`, `/cms/dashboard`, `/cms/templates` | Inertia.js (SSR-like) | Laravel → Vue 3 via `Inertia::render()`        |
| `/cms/:slug/*`                               | Vue SPA (client-side) | Vue Router + Vuex inside `SpaController` shell |
| `/wedding/:slug`                             | Vue SPA (client-side) | Vue Router, public-facing invitation           |

Key layers:

- **Backend**: Laravel 12, SQLite, Spatie Permission for RBAC
- **State Management**: Vuex store with namespaced modules (`wedding`, `couple`, `events`, `guests`, `rsvp`, `wishes`, `media`, `payments`, `settings`, `template`)
- **API Layer**: REST endpoints at `/api/*` consumed by Vuex actions via Axios
- **Layouts**: Two `CmsLayout.vue` files exist:
    - `resources/js/Layouts/CmsLayout.vue` — Inertia layout (used by Dashboard.vue)
    - `resources/js/Pages/Cms/layouts/CmsLayout.vue` — SPA layout (used by Vue Router views, contains `SidebarNav`)

### How Changes Fit In

The UX improvements operate across both layers:

```
┌─────────────────────────────────────────────────────────────────┐
│  Inertia Layer (server-rendered props)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /cms/dashboard → AdminDashboardController → Dashboard.vue│  │
│  │  (Modified: single wedding, simplified stats)             │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  SPA Layer (Vue Router + Vuex)                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /cms/:slug/* → CmsLayout.vue → SidebarNav + router-view │  │
│  │  ├── TemaPilihan.vue (Fix: template selection persists)   │  │
│  │  ├── RsvpSection.vue (Add: 60s polling)                   │  │
│  │  ├── AmplopDigital.vue (Add: address forms)               │  │
│  │  └── All views (Add: LivePreview panel)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Changes

### 2.1 Dashboard.vue (Inertia Page)

**File**: `resources/js/Pages/Cms/Dashboard.vue`

**Current behavior**: Regular users see 3 stat cards (Undangan Saya, Total Tamu, Total RSVP) and a grid of wedding cards with "Lihat Live" / "Kelola" buttons.

**Required changes**:

1. **Remove "Undangan Saya" stat card** — reduce from 3 to 2 cards (Total Tamu, Total RSVP).
2. **Single wedding card** — instead of a grid, show a single prominent card for the user's wedding. Remove the multi-card layout.
3. **Replace "Kelola" button with "Edit Undangan"** — navigates directly to `/cms/:slug/undangan/tema`.
4. **Keep "Lihat Demo" link** — opens `/wedding/:slug` in a new tab.
5. **Remove "Mode Demo Superadmin" text** if present anywhere.
6. **Empty state** — if user has no wedding, show message: "Belum ada undangan. Hubungi admin."

**Props change**: The `recentWeddings` prop for regular users will become a single `wedding` object (or first element of array capped at 1 from controller).

```vue
<!-- Simplified Regular User Stats (new) -->
<div class="grid gap-4 sm:grid-cols-2">
  <StatCard title="Total Tamu" :value="wedding.guests_count" icon="Users" />
  <StatCard title="Total RSVP" :value="wedding.rsvps_count" icon="CircleCheck" />
</div>

<!-- Single Wedding Card (new) -->
<WeddingCard :wedding="wedding">
  <a :href="`/wedding/${wedding.slug}`" target="_blank">Lihat Demo</a>
  <a :href="`/cms/${wedding.slug}/undangan/tema`">Edit Undangan</a>
</WeddingCard>
```

### 2.2 LivePreview Component

**New file**: `resources/js/Pages/Cms/components/shared/LivePreview.vue`

**Purpose**: A reusable phone-mockup preview panel that renders the active template with current form data in real-time.

**Design**:

```
┌──────────────────────────────────────────────────────┐
│  CMS Editor View (e.g., InfoAcara.vue)               │
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │  Form Panel (left)  │  │  LivePreview (right)   │  │
│  │  - Fields           │  │  ┌──────────────────┐  │  │
│  │  - Buttons          │  │  │  Phone Mockup    │  │  │
│  │                     │  │  │  ┌────────────┐  │  │  │
│  │                     │  │  │  │ <iframe>   │  │  │  │
│  │                     │  │  │  │ /wedding/  │  │  │  │
│  │                     │  │  │  │  :slug     │  │  │  │
│  │                     │  │  │  │ #section   │  │  │  │
│  │                     │  │  │  └────────────┘  │  │  │
│  │                     │  │  └──────────────────┘  │  │
│  └────────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Implementation approach**:

- **Option A (Recommended): Component-based rendering** — Dynamically import the active template component and render it inside the preview panel with current Vuex store data. This avoids iframe complexity and shares the same Vue reactivity.
- **Option B: iframe** — Embed `/wedding/:slug?preview=1` in an iframe and use `postMessage` to push data changes. More isolated but slower updates.

**Chosen: Option A** — leverages existing template components from `resources/js/Pages/Landing/invitation/templates/`. The preview scales down using CSS `transform: scale(0.35)` inside a phone-shaped container.

**Props**:

```typescript
interface LivePreviewProps {
    templateId: string; // Current template slug (e.g., 'jawa-klasik')
    section?: string; // Optional section to scroll to
}
```

**Reactive data source**: The preview reads from Vuex store modules (`couple`, `events`, `settings`, etc.) which are updated by the form components in real-time as users type.

**Responsive behavior**:

- `≥1024px`: Side-by-side layout (form left, preview right)
- `<1024px`: Preview hidden, show a floating "👁️ Preview" toggle button that opens an overlay/modal

**Debouncing**: Form data changes trigger preview re-render with a 500ms debounce to stay within the 2-second requirement.

### 2.3 TemaPilihan.vue (Template Selection Fix)

**File**: `resources/js/Pages/Cms/views/undangan/TemaPilihan.vue`

**Current bug**: Clicking a template card updates `form.templateId` locally but the `handleSave()` only calls `settings/saveSettings` which persists to the `settings` API. The `template/selectTemplate` Vuex action is never called, and there's no API call to persist `templateId` to the wedding's `custom_templates` or `settings` record on the backend.

**Required changes**:

1. **Wire template selection to backend**: When user clicks "Pilih Template" card, dispatch `settings/saveSettings` with `{ templateId }` immediately (or on save). The `SettingApiController` already handles this — verify it persists `templateId` to the `settings` JSON column.

2. **Persist on click** (optimistic): On card click, dispatch `template/selectTemplate` to update Vuex immediately, then on "Simpan Tema" click, save to backend via `settings/saveSettings`.

3. **Visual indicator for active template**: Add a checkmark badge/border highlight to the card matching `form.templateId`. Currently `template-card--active` class exists — ensure the comparison uses the correct ID format (slug string vs numeric ID).

4. **Thumbnail matching fix**: Template cards currently use `tmplGradient(tmpl.id)` for colored swatches. Need to replace with actual thumbnail images that match live template rendering (see Section 6).

5. **Error handling**: Wrap `handleSave` in try/catch, show toast notification on failure.

6. **Remove admin-only actions**: For regular users, hide any "Edit Template" / "Delete Template" UI that may exist. Currently not present in this view, but enforce via prop/role check.

**Data flow for template selection**:

```
User clicks template card
  → form.templateId = tmpl.id (local)
  → store.dispatch('template/selectTemplate', tmpl.id) (Vuex)

User clicks "Simpan Tema"
  → store.dispatch('settings/saveSettings', { templateId, themeColors, fontFamily })
  → PUT /api/weddings/:slug/settings
  → Backend persists to `settings` table
  → LivePreview re-renders with new template
```

### 2.4 SidebarNav.vue (Visibility Fix)

**File**: `resources/js/Pages/Cms/components/shared/SidebarNav.vue`

**Current state**: The sidebar already displays all 12 sub-menu items and handles locked features with the 🔒 icon. The `isLocked()` function checks `allowedFeatures` from Vuex.

**Potential issue**: The sidebar may not render on initial load if `wedding/fetchUserProfile` hasn't completed before the component mounts, causing `allowedFeatures` to default to `[]` and marking everything as locked.

**Required changes**:

1. **Ensure profile loads before rendering nav items**: Add a loading state. Show skeleton/spinner for sub-menu until `userProfile` is loaded.

2. **Guard against empty allowedFeatures**: If `allowedFeatures` is `null` or profile hasn't loaded yet, default to showing items as accessible (not locked) to avoid flash of all-locked state. Once profile loads, apply correct lock states.

3. **Verify sidebar renders on direct URL access**: When a user navigates directly to `/cms/:slug/undangan/tema`, the router guard already calls `fetchUserProfile`. Confirm that SidebarNav reacts to the Vuex state change.

4. **Add "Lihat Demo" button**: Already exists as "Preview Undangan" link. Rename label from "Preview Undangan" to "Lihat Demo" per Requirement 5.

### 2.5 RSVP Polling Mechanism

**File**: `resources/js/Pages/Cms/views/undangan/RsvpSection.vue`

**Current state**: No polling — data is fetched once (or not at all; current component uses only local `ref` state without Vuex integration).

**Required changes**:

1. **Connect to Vuex RSVP store**: On mount, dispatch `rsvp/fetchRsvps` to load initial data. Display `rsvp/rsvps` getter in a list/table.

2. **Add 60-second polling interval**:

```javascript
import { onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";

const store = useStore();
let pollInterval = null;

onMounted(() => {
    store.dispatch("rsvp/fetchRsvps");
    pollInterval = setInterval(() => {
        store.dispatch("rsvp/fetchRsvps");
    }, 60000);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
});
```

3. **Silent error handling**: If polling request fails, suppress the error (don't show to user), just retry on next interval. Modify the `fetchRsvps` action or add a `silentFetchRsvps` variant that doesn't commit errors.

4. **Display RSVP list**: Show a table of RSVP responses below the form settings, with columns: Name, Status (Hadir/Tidak Hadir), Number of Companions, Timestamp.

### 2.6 AmplopDigital.vue (Address Form Addition)

**File**: `resources/js/Pages/Cms/views/undangan/AmplopDigital.vue`

**Current state**: Has bank account forms and a "thank you" message. No physical address fields exist.

**Required changes**:

1. **Add address section below bank accounts**:

```javascript
// Add to form ref
addresses: {
  groom: { recipientName: '', fullAddress: '', city: '', postalCode: '', phone: '' },
  bride: { recipientName: '', fullAddress: '', city: '', postalCode: '', phone: '' }
}
```

2. **UI**: Two collapsible address cards (one for groom, one for bride), each with 5 fields:
    - Nama Penerima (recipient name)
    - Alamat Lengkap (full address, textarea)
    - Kota (city)
    - Kode Pos (postal code)
    - Nomor HP (phone)

3. **Save integration**: Include address data in the `handleSave()` payload sent to the API.

4. **Preview panel update**: Show addresses in the live preview section with a house icon (🏠) below the bank accounts.

5. **Backend**: The `PaymentApiController` or a new `AmplopApiController` must handle the address data. Likely stored in the `settings` JSON column or a dedicated column on the `weddings` table.

---

## 3. Backend Changes

### 3.1 AdminDashboardController Modifications

**File**: `app/Http/Controllers/Admin/AdminDashboardController.php`

**Changes for Regular User response**:

```php
// Current: returns ALL user weddings (could be multiple)
$recentWeddings = Wedding::where('user_id', $user->id)->get();

// New: return at most ONE wedding
$wedding = Wedding::with(['user', 'couple', 'events'])
    ->withCount(['guests', 'rsvps'])
    ->where('user_id', $user->id)
    ->first();
```

**New Inertia props for regular user**:

```php
return Inertia::render('Cms/Dashboard', [
    'isSuperAdmin' => false,
    'wedding' => $wedding ? $this->mapWedding($wedding) : null,
    'totalGuests' => $wedding ? $wedding->guests_count : 0,
    'totalRsvps' => $wedding ? $wedding->rsvps_count : 0,
]);
```

Remove `totalWeddings`, `totalUsers`, `activeUsers`, `totalCustomTemplates`, `recentUsers` from regular user payload.

### 3.2 Settings API Enhancement

**Endpoint**: `PUT /api/weddings/:slug/settings`

**Current**: Persists `templateId`, `themeColors`, `fontFamily` to the `settings` table.

**New fields to support**:

- `addresses.groom` — object with address fields
- `addresses.bride` — object with address fields

The `settings` table uses a JSON column, so no migration is needed — just expand the payload.

### 3.3 Template Selection API

**Endpoint**: `PUT /api/weddings/:slug/settings` (reuses existing)

**Behavior**: When `templateId` is included in the payload, it updates the wedding's active template. The `SettingApiController` must ensure this field is persisted and returned on subsequent `GET` requests.

**Validation**: Validate that `templateId` exists in the `custom_templates` table or matches a known built-in template slug.

### 3.4 RSVP Polling Endpoint

**Existing endpoint**: `GET /api/weddings/:slug/rsvps` (via `RsvpApiController`)

No new endpoint needed — the existing endpoint returns the full RSVP list. The frontend simply calls it on a 60-second interval.

### 3.5 No New Migrations Required

All new data (addresses, template selection) fits within the existing `settings` JSON column. No schema changes needed.

---

## 4. Data Flow

### 4.1 Live Preview Data Flow

```
┌─────────────────────┐         ┌──────────────────┐
│  Form Component     │         │  Vuex Store      │
│  (e.g., InfoAcara)  │────────▶│  events/         │
│  v-model bindings   │ commit  │  couple/         │
│                     │         │  settings/       │
└─────────────────────┘         └────────┬─────────┘
                                         │ reactive getters
                                         ▼
                                ┌──────────────────┐
                                │  LivePreview.vue │
                                │  Renders active  │
                                │  template with   │
                                │  store data      │
                                └──────────────────┘
```

**Key principle**: Form components write to Vuex store modules. LivePreview reads from the same modules. Vue's reactivity system ensures the preview updates automatically when store state changes.

**Debounce strategy**: Form inputs use `@input` with a 500ms debounce before committing to store, preventing excessive re-renders during rapid typing.

### 4.2 Template Selection Persistence

```
User selects template in TemaPilihan.vue
  │
  ├─▶ Vuex: template/selectTemplate (immediate UI feedback)
  │
  └─▶ User clicks "Simpan Tema"
       │
       ├─▶ Vuex: settings/saveSettings({ templateId, themeColors, fontFamily })
       │
       ├─▶ API: PUT /api/weddings/:slug/settings
       │         Body: { templateId: "bali-dewata", themeColors: {...}, fontFamily: "..." }
       │
       ├─▶ Backend: SettingApiController → updates `settings` record
       │
       └─▶ Response: saved settings object
            │
            └─▶ Vuex: settings/SET_DATA (confirms persistence)
                 │
                 └─▶ LivePreview re-renders with new template component
```

### 4.3 RSVP Polling Data Flow

```
RsvpSection.vue mounted
  │
  ├─▶ Initial: dispatch('rsvp/fetchRsvps')
  │     └─▶ GET /api/weddings/:slug/rsvps → SET_ITEMS
  │
  └─▶ setInterval (60s):
        └─▶ dispatch('rsvp/fetchRsvps')
              └─▶ GET /api/weddings/:slug/rsvps
                    ├─▶ Success: SET_ITEMS (UI updates reactively)
                    └─▶ Failure: silently ignore, retry next interval
```

### 4.4 Dashboard → CMS Editor Navigation

```
Regular User Login
  │
  └─▶ /cms/dashboard (Inertia page)
       │
       └─▶ Controller returns single wedding { slug, guests_count, rsvps_count }
            │
            └─▶ User clicks "Edit Undangan"
                 │
                 └─▶ window.location = /cms/:slug/undangan/tema
                      │
                      └─▶ SpaController serves Vue SPA shell
                           │
                           └─▶ Vue Router activates CmsLayout + TemaPilihan view
                                │
                                └─▶ SidebarNav renders with all 12 items
```

---

## 5. Template Thumbnail Strategy

### Current Problem

Template thumbnails in `TemaPilihan.vue` use CSS gradient swatches (`tmplGradient()`) which don't represent the actual template design. Users see a colored block but can't tell what the invitation will look like.

### Solution: Screenshot-Based Thumbnails

**Approach**: Generate static PNG thumbnails from actual template renderings.

#### Generation Strategy

1. **Build-time generation** (recommended for this project):
    - Create a Node.js script using Puppeteer or Playwright
    - For each template in `resources/js/Pages/Landing/invitation/templates/`:
        - Render the template component with placeholder data in a headless browser
        - Capture a viewport-sized screenshot (375×667px, iPhone SE dimensions)
        - Save as `public/images/templates/{template-slug}-thumb.png`
    - Run as part of the build pipeline or manually when templates change

2. **Storage location**: `public/images/templates/`

3. **Naming convention**: `{template-slug}-thumb.png` (e.g., `jawa-klasik-thumb.png`)

#### Integration in TemaPilihan.vue

Replace the gradient swatch with an `<img>` tag:

```vue
<template>
    <button
        class="template-card"
        :class="{ 'template-card--active': form.templateId === tmpl.id }"
    >
        <img
            :src="`/images/templates/${tmpl.id}-thumb.png`"
            :alt="tmpl.name"
            class="template-thumbnail"
            loading="lazy"
        />
        <span class="template-name">{{ tmpl.name }}</span>
    </button>
</template>
```

#### Thumbnail Regeneration Workflow

When Super_Admin updates a template:

1. Admin edits template component code
2. Admin runs: `npm run generate-thumbnails` (or it's triggered post-deploy)
3. Script navigates to `/wedding/preview-{slug}` with placeholder data
4. Captures screenshot, overwrites existing thumbnail
5. Thumbnails are committed to repo or stored in public assets

#### Fallback

If thumbnail doesn't exist (new template, generation hasn't run), fall back to the existing gradient swatch approach.

```vue
<img
    :src="`/images/templates/${tmpl.id}-thumb.png`"
    @error="$event.target.src = ''"
    v-if="thumbnailExists(tmpl.id)"
/>
<div
    v-else
    class="template-swatch"
    :style="{ background: tmplGradient(tmpl.id) }"
>
  <span class="template-icon">{{ tmplIcon(tmpl.id) }}</span>
</div>
```

---

## 6. File Change Summary

| File                                                       | Action | Description                                                         |
| ---------------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| `app/Http/Controllers/Admin/AdminDashboardController.php`  | Modify | Return single wedding + 2 stats for regular user                    |
| `resources/js/Pages/Cms/Dashboard.vue`                     | Modify | Simplify regular user view: 2 stats, 1 card, "Edit Undangan" button |
| `resources/js/Pages/Cms/components/shared/LivePreview.vue` | Create | Reusable phone-mockup preview component                             |
| `resources/js/Pages/Cms/views/undangan/TemaPilihan.vue`    | Modify | Fix template persistence, add thumbnails, error handling            |
| `resources/js/Pages/Cms/views/undangan/RsvpSection.vue`    | Modify | Connect to Vuex, add 60s polling, display RSVP list                 |
| `resources/js/Pages/Cms/views/undangan/AmplopDigital.vue`  | Modify | Add bride/groom address forms                                       |
| `resources/js/Pages/Cms/components/shared/SidebarNav.vue`  | Modify | Add loading state, rename preview label to "Lihat Demo"             |
| `resources/js/Pages/Cms/layouts/CmsLayout.vue`             | Modify | Integrate LivePreview panel in layout                               |
| `resources/js/store/modules/template.js`                   | Modify | Add persistence action for template selection                       |
| `resources/js/store/modules/rsvp.js`                       | Modify | Add silent fetch variant for polling                                |
| `scripts/generate-thumbnails.js`                           | Create | Puppeteer script for template screenshot generation                 |
| `public/images/templates/`                                 | Create | Directory for template thumbnail images                             |

---

## 7. Responsive Design Considerations

| Viewport         | Layout                                                      |
| ---------------- | ----------------------------------------------------------- |
| ≥1280px (xl)     | Form (60%) + LivePreview (40%) side by side                 |
| 1024–1279px (lg) | Form (55%) + LivePreview (45%) side by side, smaller mockup |
| <1024px (md/sm)  | Form full-width, floating preview button → overlay modal    |

The `section-layout` class in `section.css` already provides a two-column layout. Modify it to conditionally include LivePreview at breakpoints.

---

## 8. Performance Considerations

1. **LivePreview rendering**: Use `<Suspense>` + dynamic `import()` for template components to avoid loading all templates upfront.
2. **Debounced updates**: 500ms debounce on form inputs before triggering store mutations.
3. **RSVP polling**: 60-second interval is lightweight. Add `visibilitychange` listener to pause polling when tab is inactive.
4. **Template thumbnails**: Lazy-load images with `loading="lazy"` attribute. Thumbnails should be optimized (WebP, ~30KB each).
5. **SidebarNav**: Profile fetch is already in the router guard; avoid duplicate fetches in component `onMounted`.

---

## 9. Security & Access Control

- Template selection API validates that the user owns the wedding (existing middleware).
- Address data is sanitized server-side before storage (XSS prevention).
- RSVP polling uses the same authenticated API — no new auth surface.
- Regular users cannot access template CRUD endpoints (enforced by `role:super-admin` middleware on routes).
- The Dashboard controller already filters data by `user_id` for non-super-admin users.
