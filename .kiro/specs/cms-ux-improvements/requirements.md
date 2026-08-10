# Requirements Document

## Introduction

This document specifies the UX improvements for the WeddingApp CMS, focusing on simplifying the regular user flow (single-wedding model), introducing dual preview modes (live sidebar preview and full-page demo), fixing template selection behavior, ensuring all CMS sidebar features are visible and functional for regular users, and correcting template thumbnail mismatches.

## Glossary

- **CMS**: The content management system accessible at `/cms/*` routes, used by both Super_Admin and Regular_User to manage wedding invitations.
- **Super_Admin**: A user with the `super-admin` role who manages all users, templates, roles, and ACL settings.
- **Regular_User**: An authenticated user without the `super-admin` role who manages their own single wedding invitation.
- **Dashboard**: The main landing page after login (`/cms/dashboard`) showing role-appropriate statistics and actions.
- **CMS_Editor**: The Vue SPA section at `/cms/:slug/*` where a user edits their wedding invitation content through sidebar navigation.
- **Live_Preview**: A phone mockup panel displayed beside the CMS form that renders the invitation template in real-time as the user edits data.
- **Demo_Page**: The full-page public-facing invitation view at `/wedding/:slug` that shows the user's real data if filled, or hardcoded placeholder data if empty.
- **Template_Gallery**: The "Tema & Template" view inside the CMS_Editor where users browse and select templates.
- **Template_Thumbnail**: A preview image representing a template in the Template_Gallery.
- **Locked_Feature**: A CMS sidebar menu item that is disabled (shown with 🔒 icon) because the Super_Admin has not granted the user access to that feature.
- **Allowed_Features**: The list of feature keys stored on a user record that determines which CMS sections are accessible.
- **Sidebar_Nav**: The navigation component within the CMS_Editor that lists all available sections for editing the wedding invitation.

## Requirements

### Requirement 1: Single Wedding Model for Regular User

**User Story:** As a Regular_User, I want to manage only one wedding invitation, so that the interface is simple and focused without multi-wedding complexity.

#### Acceptance Criteria

1. THE Dashboard SHALL display exactly one wedding card for the Regular_User (their own wedding).
2. WHEN a Regular_User has an existing wedding, THE Dashboard SHALL display a direct "Edit Undangan" button that navigates to the CMS_Editor for that single wedding.
3. WHEN a Regular_User has an existing wedding, THE Dashboard SHALL NOT display a "Kelola" button or any multi-wedding selection interface.
4. THE AdminDashboardController SHALL return at most one wedding record for Regular_User responses.
5. THE Regular_User Dashboard SHALL NOT display any information about other users or their weddings — only the user's own data is visible.

### Requirement 2: Simplified Regular User Dashboard Statistics

**User Story:** As a Regular_User, I want to see only relevant statistics on my dashboard, so that I can quickly understand my guest and RSVP status.

#### Acceptance Criteria

1. THE Dashboard SHALL display exactly two statistic cards for the Regular_User: "Total Tamu" (total guests) and "Total RSVP" (total confirmations).
2. THE Dashboard SHALL NOT display a "Jumlah Undangan" (invitation count) statistic card for the Regular_User.
3. THE Dashboard SHALL NOT display a template list section for the Regular_User.

### Requirement 3: Live Preview Sidebar Panel

**User Story:** As a Regular_User, I want to see a phone mockup preview beside the CMS form, so that I can see real-time changes as I fill in my wedding data.

#### Acceptance Criteria

1. WHEN a Regular_User is editing any section in the CMS_Editor, THE CMS_Editor SHALL display a Live_Preview panel beside the editing form.
2. THE Live_Preview SHALL render the selected template inside a phone-sized mockup frame.
3. WHEN the Regular_User modifies form data, THE Live_Preview SHALL update within 2 seconds to reflect the changes.
4. THE Live_Preview SHALL use the wedding's currently selected template for rendering.
5. IF the browser viewport width is less than 1024 pixels, THEN THE CMS_Editor SHALL hide the Live_Preview panel and display a toggle button to show it in an overlay.

### Requirement 4: Demo Page Preview Mode

**User Story:** As a Regular_User, I want to view a full-page demo of my invitation, so that I can see exactly how guests will experience the final product.

#### Acceptance Criteria

1. THE CMS_Editor SHALL provide a "Lihat Demo" button that opens the Demo_Page at `/wedding/:slug` in a new browser tab.
2. WHEN the wedding has user-filled data, THE Demo_Page SHALL render using the real saved data.
3. WHEN the wedding has no user-filled data for a section, THE Demo_Page SHALL render that section using hardcoded placeholder data.
4. THE Dashboard SHALL provide a "Lihat Demo" link for the Regular_User's wedding card that opens the Demo_Page.

### Requirement 5: Remove Demo Superadmin Wording

**User Story:** As a user of the system, I want consistent and role-neutral labeling, so that the interface does not display confusing role-specific mode labels.

#### Acceptance Criteria

1. THE CMS SHALL NOT display the text "Mode Demo Superadmin" in any view accessible by Regular_User.
2. THE CMS SHALL NOT display the text "Mode Demo Superadmin" in any view accessible by Super_Admin.
3. WHEN referencing the full-page preview, THE CMS SHALL use the label "Lihat Demo" consistently.

### Requirement 6: Template Selection Functionality

**User Story:** As a Regular_User, I want the "Pilih Template" button to actually apply the selected template, so that my invitation uses the template I chose.

#### Acceptance Criteria

1. WHEN a Regular_User clicks "Pilih Template" on a template card in the Template_Gallery, THE CMS_Editor SHALL persist the selected template to the wedding record.
2. WHEN a template is successfully selected, THE Live_Preview SHALL update to render using the newly selected template.
3. WHEN a template is successfully selected, THE Template_Gallery SHALL visually indicate the active template with a distinct highlight or badge.
4. IF the template selection API call fails, THEN THE CMS_Editor SHALL display an error notification to the Regular_User.

### Requirement 7: CMS Editor Sidebar Visibility for Regular User

**User Story:** As a Regular_User, I want to see all CMS editor sidebar features available to me, so that I can manage every aspect of my wedding invitation from a single navigation.

#### Acceptance Criteria

1. THE Sidebar_Nav SHALL display all 12 sub-menu items under "Undangan Digital" for the Regular_User: Tema & Template, RSVP Online, Informasi Acara, Love Story, Manajemen Tamu, Amplop Digital, Galeri, Countdown, QR Check-In, Live Streaming, Ucapan & Doa, and Wishlist.
2. WHEN a feature is included in the user's Allowed_Features list, THE Sidebar_Nav SHALL render the menu item as a clickable navigation link.
3. WHEN a feature is NOT included in the user's Allowed_Features list, THE Sidebar_Nav SHALL render the menu item as a disabled element with a 🔒 icon.
4. THE Sidebar_Nav SHALL be visible on initial load of any CMS_Editor route for the Regular_User.

### Requirement 8: Template-Only Selection for Regular User

**User Story:** As a Regular_User, I want to select templates without being able to edit them, so that I can personalize my invitation appearance within the boundaries set by the admin.

#### Acceptance Criteria

1. THE Template_Gallery SHALL display template cards with a "Pilih Template" action for the Regular_User.
2. THE Template_Gallery SHALL NOT display "Edit Template" or "Delete Template" actions for the Regular_User.
3. THE Template_Gallery SHALL NOT allow the Regular_User to create new templates.

### Requirement 9: RSVP Real-Time Polling

**User Story:** As a Regular_User, I want the RSVP section to automatically refresh data, so that I can see new guest confirmations without manually reloading.

#### Acceptance Criteria

1. WHILE the Regular_User is viewing the RSVP Online section, THE CMS_Editor SHALL fetch updated RSVP data from the server every 60 seconds.
2. WHEN new RSVP data is fetched, THE RSVP Online section SHALL update the displayed list without requiring a page reload.
3. IF the RSVP polling request fails, THEN THE CMS_Editor SHALL retry on the next 60-second interval without displaying an error to the user.

### Requirement 10: Amplop Digital Address Form

**User Story:** As a Regular_User, I want to add home addresses for bride and groom to the digital envelope section, so that guests can send physical gifts to the correct addresses.

#### Acceptance Criteria

1. THE Amplop Digital section SHALL display form fields for bank account information.
2. THE Amplop Digital section SHALL display an "Add Address" form for the bride's home address containing fields: recipient name, full address, city, postal code, and phone number.
3. THE Amplop Digital section SHALL display an "Add Address" form for the groom's home address containing fields: recipient name, full address, city, postal code, and phone number.
4. WHEN address data is saved, THE Demo_Page SHALL display the saved addresses in the digital envelope section.

### Requirement 11: Template Thumbnail Accuracy

**User Story:** As a Regular_User, I want template thumbnails to accurately represent the live demo templates, so that I can make an informed template choice.

#### Acceptance Criteria

1. THE Template_Thumbnail for each template SHALL visually match the corresponding live demo rendering of that template.
2. WHEN a template design is updated by the Super_Admin, THE Template_Thumbnail SHALL be regenerated to reflect the updated design.
3. THE Template_Gallery SHALL display the Template_Thumbnail at a consistent aspect ratio across all template cards.

### Requirement 12: Super Admin Dashboard Unchanged

**User Story:** As a Super_Admin, I want my dashboard and management views to remain unchanged, so that existing admin workflows are not disrupted.

#### Acceptance Criteria

1. THE Dashboard SHALL display four statistic cards for Super_Admin: Total Pengguna, User Aktif Undangan, Total Undangan, and Template Kustom.
2. THE Dashboard SHALL display a list of all weddings with "Lihat Live" and "Detail" actions for Super_Admin.
3. THE Dashboard SHALL display a "Pengguna Terbaru" table for Super_Admin.
4. THE Super_Admin SHALL retain access to Kelola Users, Roles, ACL, and Templates management views.

### Requirement 13: Direct CMS Entry for Regular User

**User Story:** As a Regular_User, I want to navigate directly to the CMS editor from my dashboard, so that I do not need intermediate steps to start editing my invitation.

#### Acceptance Criteria

1. WHEN a Regular_User clicks the "Edit Undangan" button on the Dashboard, THE CMS SHALL navigate to `/cms/:slug/undangan/tema` (the first section of the CMS_Editor).
2. THE Dashboard SHALL NOT display a wedding picker or selection dropdown for the Regular_User.
3. WHEN a Regular_User has no wedding created, THE Dashboard SHALL display a message indicating no invitation exists and instruct the user to contact the admin.
