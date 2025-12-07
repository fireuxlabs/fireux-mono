# Stacks audit (organisms-level parity)

## Snapshot by stack

- **Jobs (fireux-jobs)**
  - Pages: jobs index/create/detail/learn-more/edit.
  - Components: `Organisms/Jobs/{CTA,Create,Sections/AgentCollection,Sections/GlobalCollection}`; object create `Organisms/objects/Job/Create/System.vue`.
  - Cards live under profiles (Agent/Professional: Cards/{Cell,Pill}; no Profile card).
  - CTA gate: needs agent profile (not admin-based).
- **Blog (fireux-blogs)**
  - Pages: blog index/create/detail.
  - Components: `organisms/Blog/{CTA,List,Cards/*,Create/*,objects/Post/Create/System.vue}`.
  - Cards: Article, Cell, Page, Product (no Pill/Profile). CTA admin-gated.
- **Product (fireux-products)**
  - Pages: products index/create/detail.
  - Components: `organisms/Product/{CTA,Cards/*,Create/*,objects/Product/Create/System.vue}`.
  - Cards: List, Prices, Product (no Cell/Pill/Profile). CTA admin-gated.
- **Places (fireux-places)**
  - Pages: places index only.
  - Components: `organisms/places/{Cell.vue,List.vue,Search/*}`; no CTA, no Cards dir.
- **Misebox ecosystem**
  - Kitchen: `Kitchen/KitchenWizard.vue` only (no CTA/create route).
  - objects: Ingredient (Cards {Cell,Pill,Profile}, Create/System), Recipe (Cards/Pill only).
  - profiles: Chef/Supplier (CTA, Cards {Cell,Pill}, Create/System, Edit, Sections {Local,Global}); shared SupplierQuickCreate.
- **Core (fireux-core)**
  - Components: App/Auth/Profile/User with Cards {Cell,Pill,Profile}; User CTA.
  - Framework layer; no object create expectations.

## Common vs unique directories
- Common (should standardize): `CTA.vue`, `Cards/`, `Create/`, optional `objects/<Object>/Create/System.vue`, `Sections/` (where lists split), `Cards/{Cell,Pill}`.
- Unique/special:
  - Blog/Product have domain-specific cards (Article/Page/Product/Prices) instead of Cell/Pill/Profile.
  - Places uses `places/` instead of Cards; no CTA.
  - Jobs uses uppercase `Organisms/` and places cards under profile subdomains, not under Jobs root.
  - Kitchen wizard is top-level, not under objects; Ingredient/Recipe are under objects.

## CTA patterns
- Admin-gated: Blog CTA, Product CTA.
- Profile-gated: Jobs CTA (needs agent profile), Chef/Supplier CTAs (per profile context).
- Ungated/general: Core User CTA.
- Missing CTA: Places, Kitchen.

## Misalignments & notes
- Cards naming/placement:
  - Product: no Cell/Pill/Profile; only List/Prices/Product.
  - Blog: has Cell but no Pill/Profile; domain-specific Article/Page/Product cards.
  - Jobs profiles: no Profile card; cards only under profile subdomains, not Jobs root.
  - Recipe: only Pill card (no Cell/Profile). Places: no Cards dir.
- Objects layer:
  - Present for Jobs/Blog/Product/Ingredient/Recipe; absent for Places and Kitchen wizard.
- Directory casing: Jobs uses `Organisms/` (Pascal); others use `organisms/`.
- CTAs: inconsistent gates; some stacks missing CTA entirely (Places/Kitchen).

## Recommendations (proposed pattern)
- Cards: require `Cards/{Cell.vue,Pill.vue}` per stack; optionally `Profile.vue`; allow extras (Article/Page/Product/Prices) alongside the base set.
- CTA: each stack should surface a CTA at index; document gate (admin or profile) per stack. Add CTAs for Kitchen and Places or explicitly document exceptions.
- Objects layer: if a stack has create flows, provide `objects/<Object>/Create/System.vue` wrapper; otherwise document why absent.
- Directory naming: keep Cards/Create/objects at the same level under the domain folder; consider adding thin Jobs/Cards shim if desired for symmetry.
- Casing: consider normalizing Jobs `Organisms` to lowercase `organisms` (optional, breaking change).

## Quick action list
1) Add base cards where missing: Product (Cell/Pill/Profile), Jobs profiles (Profile), Recipe (Cell/Profile), Places (Cards dir with Cell/Pill/Profile wrappers).
2) Add CTAs: Kitchen (and optionally Places) with clear gate rules; surface on page.
3) Document gate policy: admin (Blog/Product), profile (Jobs Agent), domain-specific (Chef/Supplier), none (Places?)
4) Decide on `Organisms` casing normalization (Jobs) or document exception.
