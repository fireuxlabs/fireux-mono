# Nuxt UI v4 Adoption Report (core)

Date: 2025-09-19
Scope: packages/core/fireux-core/src/runtime

This report surveys current UI usage in core and maps concrete upgrade opportunities to Nuxt UI v4 components and patterns from https://ui4.nuxt.com/docs/components.

## Summary of findings

- Core heavily uses U* components already (cards, inputs, forms, badges, tabs). Many are compatible, but v4 introduces new primitives (Page, Header, Footer, Sidebar, Breadcrumb, DataTable, Command, Dropdown, Modal, Drawer, Tooltip, Form) and better layout blocks.
- High‑impact upgrades:
  1) Layouts and page scaffolding: replace custom layout shell (`layouts/dashboard.vue`, `layouts/docs.vue`) with UPage + UPageHeader + UPageAside patterns and UContainer grid utilities. This will simplify markup and produce consistent spacing/typography.
  2) Navigation menu: migrate UNavigationMenu usage to the new UNavigationMenu v4 API with items, slots for icon/label, and responsive collapsing.
  3) Forms: switch scattered UFormGroup/UInput compositions to new UForm + UFormField with Zod/yup schema support; adopt UTextarea, UInputNumber, URadioGroup props from v4 (labels, descriptions, help). Add validation messages and status icons for profile/product/blog creation forms.
  4) Overlays and flows: standardize on UModal/UDrawer for editor flows (Blog Create Advanced, Product Create sections), and use USteps for multi‑step creation if appropriate.
  5) Tables and lists: where listing users, products, blog posts—adopt UTable or UDataTable for sorting, empty state, loading states. Replace custom div maps.
  6) Feedback: use new UAlert, UToast composables for success/error, remove console.log in UI paths.
  7) Actions: unify buttons to UButton color system (primary/gray/neutral/destructive) and variants (solid/soft/ghost/outline) per v4 docs.

## Candidate files and suggestions

- Layouts
  - runtime/layouts/dashboard.vue
    - Replace structure with UPage + UPageHeader (title/actions) + UPageAside (menu) + UPageBody. Move UNavigationMenu into UPageAside using navigation items.
    - Add UBreadcrumb to page header for nested routes (optional).
  - runtime/layouts/docs.vue
    - Convert to UPage + UPageAside + UPageBody with UContentNavigation in the aside; standardize typography via prose classes.

- Pages
  - pages/dashboard/*.vue and pages/dev/*.vue
    - Wrap top sections in UPageSection components; replace repeated UCard wrappers with: UPageGrid + UCard variants (outline/soft). Use UStat for simple KPI cards if present later.
    - Use UEmpty for empty states instead of ad‑hoc placeholders.

- Navigation
  - layouts/dashboard.vue
    - Move UNavigationMenu props to new items shape in v4; add collapsible for mobile via UDrawer + UButton (hamburger) pattern.

- Forms
  - components/organisms/User/Core/Edit.vue
    - Migrate to UForm with schema; replace individual UFormGroup with UFormField. Provide description/help and error messages. Use slots for hint icons.
    - Use UAvatar + UButton + UInput (with trailing icon) for avatar URL; optionally use UFileUpload pattern if Storage import makes sense.
  - components/organisms/Product/Create/*
    - Price.vue: replace currency input pair with UInputGroup (leading adornment), ensure UInputNumber props per v4 (min/max/step). Use UFormField descriptions for guidance.
    - Stock.vue: USwitch and UInputNumber layout via UFormField inline.
    - System.vue: replace custom collapsible with UAccordion or UCollapsible v4; buttons as UButton with loading state.
    - Write.vue: UInput for title, add USlug helper inline using UInput with description and trailing icon.
  - components/organisms/Blog/Create/*
    - Advanced.vue: UAccordion + UForm; UInput with labels; add UTextarea with auto‑resize.

- Lists / Tables
  - pages/users/index.vue, components/organisms/Admin/Users/Users.vue
    - Replace custom list + badges with UTable/UDataTable. Columns: avatar/name, roles, created_at. Add sorting and empty state.
  - components/organisms/Blog/Cards/*, Product/Cards/*, User/Cards/*
    - Consider UCardSection structure: header (avatar/title/actions), body (meta), footer (badges/buttons). Use UBadge v4 variants.

- Overlays
  - Blog Create flow: if any modal/drawer usage exists, standardize on UModal/UDrawer.

- Feedback
  - Replace inline error spans with UAlert, and success toasts via useToast().

- Misc components to adopt
  - UTabs v4: verify prop names and items shape (already used in dev/design pages). Ensure using v4 UTabs with items: [{label, content}] and appropriate v-model.
  - UTooltip: confirm v4 props (popper -> placement); already appears compliant but verify.
  - USeparator: use for section dividers.

## Concrete examples (before → after)

1) Page layout shell (dashboard)
- Before: custom container + aside + main with UNavigationMenu.
- After: UPage + UPageHeader + UPageAside + UPageBody; navigation menu inside aside.

2) Form field
- Before: UFormGroup + UInput
- After: UForm + UFormField label/description + UInput; show validation via state/error prop; submit with UButton loading.

3) Data list
- Before: v-for divs of users with UBadge
- After: UTable with columns and slots; empty state via UEmpty; top actions via UButtonGroup.

## Migration notes and gotchas

- Ensure @nuxt/ui v4 is installed and configured in nuxt.config. Many components changed prop names/variants.
- Verify icons via @nuxt/icon; names changed (heroicons/lucide). Already configured.
- UForm in v4 prefers a schema (zod/yup) for best DX; otherwise, you can still manage state manually but you get labels, errors, help for free.
- UDataTable may require client‑side only rendering if dataset large; use SSR=false if needed.
- Color/variant naming: prefer primary/gray/neutral and soft/outline/ghost/solid.

## Priority roadmap

- P1: Layouts (dashboard/docs) → adopt UPage scaffolding
- P1: Critical forms (User/Core/Edit, Product/Create/*, Blog/Create/*) → UForm + UFormField
- P2: Navigation menu → UNavigationMenu v4 pattern & mobile drawer
- P2: Lists (users, blogs, products) → UTable/UDataTable
- P3: Alerts/Toasts → UAlert/useToast across flows
- P3: General polish: UPageSection, UEmpty, USeparator, UBadge variants, buttons

## Next steps

- Pick one page per area and implement end‑to‑end:
  - Layout: layouts/dashboard.vue
  - Form: components/organisms/User/Core/Edit.vue
  - List: pages/users/index.vue (or Admin/Users)
- After each change, run nuxi typecheck and do a quick dev smoke test.
- Once patterns stabilize, replicate across sibling components/pages.
