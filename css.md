# FireUX Core CSS/SCSS Inventory

This document lists the core styles, their file paths, and full contents to verify what CSS is available and whether it’s applied in apps.

Note: Paths are relative to the repo root.

---

## packages/core/fireux-core/src/runtime/assets/styles/main.css

```css
@import 'tailwindcss';
@import '@nuxt/ui';

/* Import FireUX organism styling systems */
@import './scss/main.scss';

@theme static {
  --font-sans:
    system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --space-0: 0px;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-1-5: 0.375rem;
  --space-2: 0.5rem;
  --space-2-5: 0.625rem;
  --space-3: 0.75rem;
  --space-3-5: 0.875rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-7: 1.75rem;
  --space-8: 2rem;
  --space-9: 2.25rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-4xl: 2rem;
}

/* Design Tokens info lives in assets/tokens.md */

/* Core Page Architecture - Mobile First */
.page {
  min-height: 100vh;
  width: 100%;
  padding: 1rem;
  margin: 0 auto;
  animation: fadeIn 0.3s ease-out;

  /* Mobile: full width with comfortable padding */
  max-width: 100%;

  /* Tablet: constrained width with more breathing room */
  @media (min-width: 768px) {
    padding: 2rem;
    max-width: 768px;
  }

  /* Desktop: generous spacing and wider content */
  @media (min-width: 1024px) {
    padding: 3rem 2rem;
    max-width: 1200px;
  }

  /* Ultra-wide: prevent content from getting too stretched */
  @media (min-width: 1440px) {
    padding: 4rem 2rem;
    max-width: 1440px;
  }
}

/* Enhanced Typography - Consistent vertical rhythm */
.page h1 {
  @apply text-3xl font-bold mb-8;
  line-height: 1.2;
}

.page h2 {
  @apply text-2xl font-semibold mb-6 text-gray-800;
  line-height: 1.3;
}

.page h3 {
  @apply text-xl font-medium mb-4 text-gray-800;
  line-height: 1.4;
}

/* Mobile responsive typography */
@media (min-width: 768px) {
  .page h1 {
    @apply text-4xl mb-12;
  }

  .page h2 {
    @apply text-3xl mb-8;
  }

  .page h3 {
    @apply text-2xl mb-6;
  }
}

/* Subtle Animations - Modern feel without being distracting */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Component Spacing - Consistent vertical rhythm */
.page > * + * {
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .page > * + * {
    margin-top: 3rem;
  }
}

@media (min-width: 1024px) {
  .page > * + * {
    margin-top: 4rem;
  }
}

/* Focus states - Improved accessibility */
.page a:focus,
.page button:focus {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Enhanced Cards & Components */
.page .grid {
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .page .grid {
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .page .grid {
    gap: 2.5rem;
  }
}

/* Subtle hover states for interactive elements */
.page [class*='card']:hover,
.page .hover\:shadow-md:hover {
  transform: translateY(-2px);
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out;
}

/* Better loading states */
.page [class*='loading'] {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions for all interactive elements */
.page a,
.page button,
.page [class*='card'] {
  transition: all 0.2s ease-out;
}

/* Enhanced visual hierarchy with subtle shadows */
.page [class*='card'],
.page .shadow-sm {
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}

@media (prefers-reduced-motion: reduce) {
  .page,
  .page *,
  .page::before,
  .page::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/main.scss

```scss
/* ============================
   fireux-core/assets/styles/main.scss
   FireUX Core Design System - SCSS Entry Point
   ============================ */

// Import SCSS modules using modern @use syntax (must come first)
@use './scss/base';
@use './scss/utilities';
@use './scss/grids';

// Import CSS (for Tailwind/UnoCSS integration)
@import './main.css';

//    FireUX Core CSS Classes Reference:
//    ===================================

// atoms.scss
// •	.badge

// base.scss
// (No custom CSS classes defined in this file.)

// organisms/profiles.scss - Unified Profile Component System
// •	.profile-page (page layouts)
// •	.profile-list (grid layouts)
// •	.profile-cell (base component - used by pills, cells, profiles)
// •	.profile-pill (modifier for compact pills)
// •	.profile-header (avatar + info layout)
// •	.profile-info (text content wrapper)
// •	.profile-name (primary heading)
// •	.profile-title (secondary text)
// •	.profile-bio (description text)
// •	.profile-specialties (tags container)
// •	.specialty-tag (individual tags)
// •	Domain variants: .chef-cell, .supplier-cell, .professional-cell, .employer-cell

// organisms/objects.scss
// •	Object-specific organism styles

// utilities.scss
// •	.button-group
// •	.fade-in
// •	.highlight
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/main.scss

```scss
/* ============================
   FireUX SCSS - Minimal Dev Mode Stubs
   ============================ */

/* Base foundation */
@use './base.scss';
@use './grids.scss';
@use './utilities.scss';
@use './atoms/atoms.scss';
@use './atoms/tokens.scss';

/* Organism stubs */
@use './organisms/profiles.scss';
@use './organisms/objects.scss';
@use './organisms/profile.scss';
@use './organisms/cards.scss';

/* ============================
   Available CSS Classes (Stubs for Future Development)
   ============================ */

/* 
Base: .base-container, .base-content
Grids: .grid, .grid-cols-1, .grid-cols-2, .grid-cols-3, .dashboard-grid, .profile-grid  
Utilities: .button-group, .fade-in, .flex, .flex-center, .highlight
Atoms: .badge, .flame-icon, .ui-icon
Cards: .card, .card.pill, .card.cell, .card-header, .card-content, .card-footer, .profile-card, .user-card
Objects: .objects, .objects .title, .objects .subtitle, .objects .description, .object-card, .object-list, .object-grid
Profiles: .profile-edit-container, .read-only-field, .edit-profile-section, .edit-profile-button, .profile-create
Profile View: .profile-view, .profile-view-header, .profile-view-avatar, .profile-view-info, .profile-view-content
*/
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/base.scss

```scss
/* ============================
   FireUX Base Styles - Minimal Dev Mode
   ============================ */

/* Essential resets only */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  overflow-x: hidden;
}

/* Stub classes for future styling */
.base-container {
  display: block; /* Future: base container styling */
}

.base-content {
  display: block; /* Future: base content styling */
}
h6,
p {
  margin: 0;
  padding: 0;
}

/* Base Typography - Let Nuxt UI and Tailwind handle most styling */
body {
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--ui-bg);
  color: var(--ui-text);
}

/* Essential Utilities - Supplement Tailwind for FireUX-specific needs */

/* Standard Button Groups */
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
  width: 100%;
}

/* Fade-In Animation */
.fade-in {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Highlight Text */
.highlight {
  color: var(--ui-primary);
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/grids.scss

```scss
/* ============================
   🔥 FIReUX Grid System - Minimal Dev Mode
   ============================ */

/* Grid stub classes - keeping names for future styling */
.grid {
  display: grid; /* Future: enhanced grid styling */
}

.grid-cols-1 {
  display: block; /* Future: single column grid */
}

.grid-cols-2 {
  display: block; /* Future: two column grid */
}

.grid-cols-3 {
  display: block; /* Future: three column grid */
}

.dashboard-grid {
  display: block; /* Future: dashboard layout */
}

.profile-grid {
  display: block; /* Future: profile layout */
}
/* Optional semantic wrapper, currently no styles */

/* Shared masonry grid styling */
.dashboard-page-grid {
  column-count: 1;
  column-gap: var(--space-4);
}

/* Tablets: Two columns */
@media (min-width: 768px) {
  .dashboard-page-grid {
    column-count: 2;
  }
}

/* Desktops: Three columns */
@media (min-width: 1024px) {
  .dashboard-page-grid {
    column-count: 3;
  }
}

.dashboard-page-grid > div {
  break-inside: avoid;
  margin-bottom: var(--space-4);
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/utilities.scss

```scss
/* ============================
   FireUX Utilities - Minimal Dev Mode Stubs
   ============================ */

/* Utility stub classes */
.button-group {
  display: flex; /* Future: enhanced button group styling */
}

.fade-in {
  display: block; /* Future: fade-in animation */
}

.flex {
  display: flex; /* Future: enhanced flex utilities */
}

.flex-center {
  display: flex; /* Future: flex centering utilities */
}

.highlight {
  display: inline; /* Future: text highlighting */
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/profiles.scss

```scss
/* ============================
   FireUX Profiles - Minimal Dev Mode Stubs  
   ============================ */

/* Profile edit stubs */
.profile-edit-container {
  display: flex; /* Future: enhanced edit container styling */
}

.read-only-field {
  display: block; /* Future: read-only field styling */
}

.read-only-field .read-only-label {
  display: block; /* Future: read-only label styling */
}

.read-only-field .value {
  display: block; /* Future: read-only value styling */
}

.edit-profile-section {
  display: block; /* Future: edit profile section styling */
}

.edit-profile-button {
  display: inline-block; /* Future: edit profile button styling */
}

/* Profile creation stubs */
.profile-create {
  display: block; /* Future: profile creation styling */
}

.profile-create .form-header {
  display: block; /* Future: form header styling */
}

.profile-create .track-info {
  display: block; /* Future: track info styling */
}

.profile-create .tags-input {
  display: block; /* Future: tags input styling */
}

.profile-create .tags-preview {
  display: block; /* Future: tags preview styling */
}

.profile-create .tag {
  display: inline-block; /* Future: tag styling */
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/objects.scss

```scss
/* ============================
   FireUX Objects - Minimal Dev Mode Stubs
   ============================ */

/* Object stub classes */
.objects {
  display: block; /* Future: enhanced object styling */
}

.objects .title {
  display: block; /* Future: object title styling */
}

.objects .subtitle {
  display: block; /* Future: object subtitle styling */
}

.objects .description {
  display: block; /* Future: object description styling */
}

/* Object type stubs */
.object-card {
  display: block; /* Future: object card styling */
}

.object-list {
  display: block; /* Future: object list styling */
}

.object-grid {
  display: block; /* Future: object grid styling */
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/profile.scss

```scss
/* ============================
   FireUX Profile View - Minimal Dev Mode Stubs
   ============================ */

/* Single profile view stubs */
.profile-view {
  display: block; /* Future: single profile view styling */
}

.profile-view-header {
  display: block; /* Future: profile header styling */
}

.profile-view-avatar {
  display: block; /* Future: profile avatar styling */
}

.profile-view-info {
  display: block; /* Future: profile info styling */
}

.profile-view-content {
  display: block; /* Future: profile content styling */
}

.profile-view-actions {
  display: block; /* Future: profile actions styling */
}

.profile-view-tabs {
  display: block; /* Future: profile tabs styling */
}

.profile-view-section {
  display: block; /* Future: profile section styling */
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/cards.scss

```scss
/* ============================
   FireUX Cards - Minimal Dev Mode Stubs
   ============================ */

/* Card stub classes */
.card {
  display: block; /* Future: enhanced card styling */
}

.card.pill {
  display: block; /* Future: pill card styling */
}

.card.cell {
  display: block; /* Future: cell card styling */
}

/* Card content stubs */
.card-header {
  display: block; /* Future: card header styling */
}

.card-content {
  display: block; /* Future: card content styling */
}

.card-footer {
  display: block; /* Future: card footer styling */
}

/* Profile card stubs */
.profile-card {
  display: block; /* Future: profile card styling */
}

.user-card {
  display: block; /* Future: user card styling */
}

/* Domain-specific stubs */
.chef-pill {
  display: block; /* Future: chef styling */
}

.supplier-pill {
  display: block; /* Future: supplier styling */
}

.professional-pill {
  display: block; /* Future: professional styling */
}

.employer-pill {
  display: block; /* Future: employer styling */
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/atoms/atoms.scss

```scss
/* ============================
   FireUX Atoms - Minimal Dev Mode Stubs
   ============================ */

/* Atom stub classes */
.badge {
  display: inline-block; /* Future: enhanced badge styling */
}

.flame-icon {
  display: inline-block; /* Future: icon styling */
}

.ui-icon {
  display: inline-block; /* Future: UI icon styling */
}
```

---

## packages/core/fireux-core/src/runtime/assets/styles/scss/atoms/tokens.scss

```scss
/* Atoms: Design Tokens - Foundation values for the entire system */

:root {
  /* FireUX Core Design Tokens */

  /* Spacing Scale - matches Tailwind defaults */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */

  /* Border Radius */
  --radius-sm: 0.125rem; /* 2px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */

  /* Typography Scale */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */
  --text-7xl: 4.5rem; /* 72px */

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* Animation Durations */
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;

  /* Z-Index Scale */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-tooltip: 1100;
}

/* Base transition for interactive elements */
.transition-base {
  transition: all var(--duration-normal) ease;
}

/* Hover lift effect for cards */
.hover-lift {
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

---

How to verify CSS is applied

- Ensure fireux-core registers its stylesheet in your Nuxt layer (createFireuxConfig should be injecting `assets/styles/main.css`).
- In browser devtools, check Sources for `/assets/styles/main.css` and the compiled SCSS chunk.
- Look for `.page`, `.button-group`, `.fade-in`, `.highlight`, etc., on your elements.
- If missing, confirm that the core module is installed and its CSS is included in `nuxt.config.ts` via the layer config.
