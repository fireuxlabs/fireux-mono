# Stacks components audit

## Snapshot by stack (pages + organisms)

- **Jobs (fireux-jobs)**
  - Pages: jobs index/create/detail/learn-more/edit.
  - Components: `Organisms/Jobs/{CTA,Create,Sections/AgentCollection,Sections/GlobalCollection}`.
  - Cards live under profiles (Agent/Professional: Cards/{Cell,Pill}; no Profile card).
  - CTA gate: needs agent profile (not admin-based).
- **Blog (fireux-blogs)**
  - Pages: blog index/create/detail.
  - Components: `organisms/Blog/{CTA,List,Cards/*,Create/*}`.
  - Cards: Article, Cell, Page, Product (no Pill/Profile). CTA admin-gated.
- **Product (fireux-products)**
  - Pages: products index/create/detail.
  - Components: `organisms/Product/{CTA,Cards/*,Create/*}`.
  - Cards: List, Prices, Product (no Cell/Pill/Profile). CTA admin-gated.
- **Places (fireux-places)**
  - Pages: places index only.
  - Components: `organisms/places/{Cell.vue,List.vue,Search/*}`; no CTA, no Cards dir.
- **Misebox ecosystem**
  - Kitchen: `Kitchen/KitchenWizard.vue` only (no CTA/create route).
  - Objects: Ingredient (Cards {Cell,Pill,Profile}, Create/System), Recipe (Cards/Pill only).
  - Profiles: Chef/Supplier (CTA, Cards {Cell,Pill}, Create/System, Edit, Sections {Local,Global}); shared SupplierQuickCreate.
- **Core (fireux-core)**
  - Components: App/Auth/Profile/User with Cards {Cell,Pill,Profile}; User CTA.
  - Framework layer; no object create expectations.

## Common vs unique directories

- Common targets: `CTA.vue`, `Cards/`, `Create/`, optional `objects/<Object>/Create/System.vue`, `Sections/` (list splits), `Cards/{Cell,Pill}`.
- Unique/special:
  - Blog/Product have domain-specific cards (Article/Page/Product/Prices) instead of Cell/Pill/Profile.
  - Places uses `places/` instead of Cards; no CTA.
  - Jobs uses uppercase `Organisms/`; cards sit under profile subdomains, not Jobs root.
  - Kitchen wizard is top-level, not under objects; Ingredient/Recipe are under objects.

## CTA patterns

- Admin-gated: Blog, Product.
- Profile-gated: Jobs CTA (needs agent profile), Chef/Supplier CTAs (per profile context).
- Ungated/general: Core User CTA.
- Missing: Places, Kitchen.

## Create-directory policy

- Full create flows where publishable artifacts must be complete before send: Blog, Product, Jobs, objectized flows (Ingredient/Recipe).
- Profile/App onboarding: lightweight; no Create dir; rely on onboarding + later edits.

## Misalignments

- Cards naming/placement gaps:
  - Product: missing Cell/Pill/Profile; only List/Prices/Product.
  - Blog: has Cell; no Pill/Profile; domain cards present.
  - Jobs profiles: no Profile card; cards live under profile subdomains.
  - Recipe: only Pill card. Places: no Cards dir.
- Objects layer missing/odd: Places lacks objects; Kitchen wizard top-level.
- Directory casing: Jobs uses `Organisms/` (Pascal); others lowercase.
- CTAs absent for Places/Kitchen.

## Proposed canonical shape (components)

- Directories: `organisms/<Stack>/{CTA.vue,Cards/,Create/,Sections/}`; objects under `organisms/<Stack>/objects/<Object>/` when they have their own create/edit flows.
- Cards: always include `Cards/{Cell.vue,Pill.vue}`; add `Profile.vue` for profile-like entities; allow extras (Article/Page/Product/Prices) alongside the base set.
- CTA gates: default to profile-gated when identity matters; admin-only for system-managed content (Blog/Product); document any ungated cases (e.g., Places) explicitly.
- Create flows: reserve Create dirs for publishable artifacts; keep onboarding lightweight for profiles/apps.
- Naming/casing: prefer lowercase `organisms/`; keep Cards/Create/Sections at the same level; avoid single-file subfolders unless grouping ≥2 files.
