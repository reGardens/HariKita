# Implementation Plan: CMS UX Improvements

## Overview

Implementasi perbaikan UX pada CMS WeddingApp, mencakup: penyederhanaan dashboard Regular User, live preview panel, perbaikan seleksi template, visibility sidebar, RSVP polling, form alamat Amplop Digital, penghapusan teks Mode Demo Superadmin, dan generasi thumbnail template.

## Tasks

- [ ] 1. Backend AdminDashboardController changes for Regular User
  - [ ] 1.1 Return single wedding with counts for Regular User
    - Modify AdminDashboardController.php to query single wedding with withCount guests and rsvps and eager-load couple and events
    - Return Inertia props: isSuperAdmin false, wedding single object or null, totalGuests, totalRsvps
    - Remove totalWeddings, totalUsers, activeUsers, totalCustomTemplates, recentUsers from regular user payload
    - _Requirements: 1.4, 1.5, 2.1, 2.2, 2.3_
  - [ ] 1.2 Add empty state handling for Regular User with no wedding
    - When no wedding exists for the user, return wedding null and zero counts
    - _Requirements: 13.3_
  - [ ] 1.3 Preserve Super Admin dashboard response unchanged
    - Ensure the existing super admin branch still returns all 4 stat cards, recent weddings list, and recent users table
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 2. Frontend Dashboard.vue simplification for Regular User
  - [ ] 2.1 Reduce stat cards to 2 for Regular User
    - Display only Total Tamu and Total RSVP stat cards using the props from the controller
    - Remove the Jumlah Undangan or Undangan Saya stat card from the regular user view
    - _Requirements: 2.1, 2.2_
  - [ ] 2.2 Display single wedding card with correct actions
    - Replace the multi-card grid with a single prominent wedding card
    - Show Edit Undangan button linking to /cms/:slug/undangan/tema
    - Show Lihat Demo link opening /wedding/:slug in a new tab
    - Remove Kelola button and any multi-wedding selection UI
    - _Requirements: 1.1, 1.2, 1.3, 4.4, 13.1, 13.2_
  - [ ] 2.3 Add empty state for no wedding
    - Display message Belum ada undangan Hubungi admin when wedding prop is null
    - _Requirements: 13.3_
  - [ ] 2.4 Remove template list section for Regular User
    - Ensure no template listing section is rendered on the regular user dashboard
    - _Requirements: 2.3_
  - [ ] 2.5 Remove Mode Demo Superadmin wording from Dashboard
    - Search and remove any occurrence of Mode Demo Superadmin text in the Dashboard view
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 3. Frontend SidebarNav visibility fix
  - [ ] 3.1 Add loading state for sidebar navigation
    - Show a skeleton or spinner for the sub-menu items until userProfile is loaded from Vuex
    - Prevent flash of all-locked state by not rendering lock icons until profile data is available
    - _Requirements: 7.4_
  - [ ] 3.2 Guard against empty allowedFeatures on initial load
    - If allowedFeatures is null or profile has not loaded, default to showing items as accessible not locked
    - Once profile loads, apply correct lock states reactively
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ] 3.3 Verify all 12 sub-menu items render for Regular User
    - Confirm the sidebar displays: Tema dan Template, RSVP Online, Informasi Acara, Love Story, Manajemen Tamu, Amplop Digital, Galeri, Countdown, QR Check-In, Live Streaming, Ucapan dan Doa, Wishlist
    - _Requirements: 7.1_
  - [ ] 3.4 Rename Preview Undangan to Lihat Demo
    - Update the preview button label in SidebarNav to use Lihat Demo consistently
    - Ensure the button opens /wedding/:slug in a new tab
    - _Requirements: 5.3, 4.1_

- [ ] 4. Frontend Template selection fix in TemaPilihan.vue
  - [ ] 4.1 Wire template selection to persist via settings API
    - On card click, update form.templateId locally and dispatch template/selectTemplate to Vuex
    - On Simpan Tema click, dispatch settings/saveSettings with templateId themeColors fontFamily to PUT /api/weddings/:slug/settings
    - _Requirements: 6.1_
  - [ ] 4.2 Add visual indicator for active template
    - Apply template-card--active class or checkmark badge to the card matching the current form.templateId
    - Ensure correct ID format comparison between slug string and numeric ID
    - _Requirements: 6.3_
  - [ ] 4.3 Add error handling for template selection
    - Wrap handleSave in try/catch, display toast notification on API failure
    - _Requirements: 6.4_
  - [ ] 4.4 Hide admin-only actions for Regular User
    - Ensure Edit Template and Delete Template buttons are not shown for non-super-admin users
    - Ensure Create Template action is not available for Regular User
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 5. Frontend LivePreview component creation and CmsLayout integration
  - [ ] 5.1 Create LivePreview.vue component
    - Create resources/js/Pages/Cms/components/shared/LivePreview.vue
    - Implement phone-mockup frame container with CSS transform scale for miniature rendering
    - Dynamically import the active template component from resources/js/Pages/Landing/invitation/templates/
    - Read data from Vuex store modules (couple, events, settings) for reactive rendering
    - Accept props: templateId string and optional section string
    - _Requirements: 3.1, 3.2, 3.4_
  - [ ] 5.2 Add debounced reactivity for form data changes
    - Implement 500ms debounce on Vuex store data changes before triggering preview re-render
    - Ensure preview updates within 2 seconds of form modification
    - _Requirements: 3.3_
  - [ ] 5.3 Implement responsive layout behavior
    - At viewport 1024px and above: display form 60 percent and LivePreview 40 percent side-by-side
    - Below 1024px: hide LivePreview, show floating Preview toggle button that opens overlay modal
    - _Requirements: 3.5_
  - [ ] 5.4 Integrate LivePreview into CmsLayout.vue
    - Modify resources/js/Pages/Cms/layouts/CmsLayout.vue to include the LivePreview panel alongside the router-view
    - Use the section-layout CSS class for two-column layout with conditional LivePreview
    - _Requirements: 3.1_
  - [ ] 5.5 Add Lihat Demo button in CMS Editor header
    - Add a button in the CMS layout toolbar that opens /wedding/:slug in a new browser tab
    - Use label Lihat Demo consistently
    - _Requirements: 4.1, 5.3_

- [ ] 6. Frontend RSVP polling mechanism
  - [ ] 6.1 Connect RsvpSection.vue to Vuex RSVP store
    - On component mount, dispatch rsvp/fetchRsvps to load initial RSVP data
    - Display rsvp/rsvps getter data in a table with columns: Name, Status, Companions, Timestamp
    - _Requirements: 9.2_
  - [ ] 6.2 Implement 60-second polling interval
    - Add setInterval calling rsvp/fetchRsvps every 60 seconds on mount
    - Clear interval on component unmount via onUnmounted
    - Add visibilitychange listener to pause polling when tab is inactive
    - _Requirements: 9.1_
  - [ ] 6.3 Add silent error handling for polling failures
    - Modify or add a silentFetchRsvps action in resources/js/store/modules/rsvp.js that suppresses errors
    - On polling failure, do not display error to user and retry on next interval
    - _Requirements: 9.3_

- [ ] 7. Frontend Amplop Digital address form
  - [ ] 7.1 Add address form fields to AmplopDigital.vue
    - Add two collapsible address cards (groom and bride) below bank account section
    - Each card contains fields: Nama Penerima, Alamat Lengkap textarea, Kota, Kode Pos, Nomor HP
    - _Requirements: 10.2, 10.3_
  - [ ] 7.2 Integrate address data with save API
    - Include addresses object with groom and bride sub-objects in the handleSave payload
    - Persist via PUT /api/weddings/:slug/settings in the settings JSON column
    - _Requirements: 10.1, 10.4_
  - [ ] 7.3 Display addresses in Demo Page
    - Ensure the public /wedding/:slug template renders saved addresses in the digital envelope section
    - _Requirements: 10.4_

- [ ] 8. Remove Mode Demo Superadmin wording globally
  - [ ] 8.1 Search and remove all occurrences across CMS views
    - Grep for Mode Demo Superadmin across all Vue components and remove or replace with appropriate labels
    - Ensure no view accessible by Regular User or Super Admin displays this text
    - _Requirements: 5.1, 5.2_
  - [ ] 8.2 Replace with Lihat Demo label where applicable
    - Any preview references should use Lihat Demo as the consistent label
    - _Requirements: 5.3_

- [ ] 9. Template thumbnail generation
  - [ ] 9.1 Create Puppeteer screenshot generation script
    - Create scripts/generate-thumbnails.js using Puppeteer or Playwright
    - For each template, render with placeholder data in headless browser at 375x667 viewport
    - Save screenshots to public/images/templates/{template-slug}-thumb.png
    - _Requirements: 11.1, 11.2_
  - [ ] 9.2 Create thumbnail directory and add npm script
    - Create public/images/templates/ directory
    - Add generate-thumbnails script to package.json
    - _Requirements: 11.2_
  - [ ] 9.3 Update TemaPilihan.vue to use thumbnail images
    - Replace tmplGradient swatch with img tag loading /images/templates/{template-slug}-thumb.png
    - Add fallback to gradient swatch via error handler when thumbnail does not exist
    - Apply consistent aspect ratio to all template cards with lazy loading
    - _Requirements: 11.1, 11.3_

- [ ] 10. Vuex store updates
  - [ ] 10.1 Add or verify template selectTemplate action in template store module
    - Ensure action updates the active template ID in Vuex state immediately
    - _Requirements: 6.1, 6.2_
  - [ ] 10.2 Add silentFetchRsvps action in rsvp store module
    - Create action variant that fetches RSVPs without committing error state on failure
    - _Requirements: 9.3_

- [ ] 11. Testing and verification
  - [ ] 11.1 Verify Regular User dashboard flow
    - Login as Regular User, see 2 stat cards, 1 wedding card with Edit Undangan and Lihat Demo
    - Click Edit Undangan, navigate to /cms/:slug/undangan/tema
    - Verify no Mode Demo Superadmin text visible
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 5.1, 13.1_
  - [ ] 11.2 Verify Super Admin dashboard unchanged
    - Login as Super Admin, see 4 stat cards, wedding list with Lihat Live and Detail, recent users table
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  - [ ] 11.3 Verify template selection persistence
    - Select a template, visual indicator shows, click Simpan Tema, reload page, same template is active
    - Verify LivePreview updates to new template after selection
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ] 11.4 Verify sidebar visibility and lock states
    - Navigate directly to /cms/:slug/undangan/tema, sidebar shows all 12 items
    - Locked features show lock icon, unlocked features are clickable links
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 11.5 Verify LivePreview rendering and responsiveness
    - Edit form fields, preview updates within 2 seconds
    - Resize browser below 1024px, preview hides, toggle button appears
    - Click toggle, overlay preview shows
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ] 11.6 Verify RSVP polling
    - Open RSVP section, data loads, wait 60s, data refreshes without page reload
    - Simulate API failure, no error shown to user
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 11.7 Verify Amplop Digital address forms
    - Fill in groom and bride address fields, save, reload, data persists
    - Check Demo Page renders addresses in digital envelope section
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ] 11.8 Verify template thumbnails
    - Run npm run generate-thumbnails, PNG files created in public/images/templates/
    - Template gallery shows thumbnail images instead of gradient swatches
    - Thumbnails display at consistent aspect ratio
    - _Requirements: 11.1, 11.2, 11.3_

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": "wave1",
      "description": "Backend changes and independent frontend fixes",
      "tasks": ["1", "3", "8", "10"]
    },
    {
      "id": "wave2",
      "description": "Dashboard frontend and template selection depends on backend",
      "tasks": ["2", "4", "6", "7"]
    },
    {
      "id": "wave3",
      "description": "LivePreview and thumbnail generation depends on template fix and sidebar",
      "tasks": ["5", "9"]
    },
    {
      "id": "wave4",
      "description": "Testing and verification depends on all implementation tasks",
      "tasks": ["11"]
    }
  ]
}
```

## Notes

- Tasks 1 and 2 must be done sequentially (backend first, then frontend).
- Tasks 3, 4, 6, 7, 8 can be parallelized as they touch different files.
- Task 5 (LivePreview) should come after tasks 3 and 4 since it integrates with the CmsLayout and uses template state.
- Task 10 (Vuex store updates) should be done alongside tasks 4 and 6 as they share the same store modules.
- Task 11 (Testing) is the final verification step after all implementation is complete.
- No database migrations are required, all new data fits in existing JSON columns.
