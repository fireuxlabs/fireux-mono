# AI/codex-threads/alignment.md

# Alignment Notes — use*Interface (2026-02-07)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Scope: `use*Interface` siblings across core + extensions, with emphasis on `useProductInterface`.

## Canon (baseline expectations)
- Interfaces are deterministic: no “smart” fallback chains that hide missing data.
- Prefer single-source fields over “best-guess” fallbacks.
- `card()` is the canonical minimal view model; other views should not add hidden fallbacks.
- Products must follow the canon: keep `useProductInterface` minimal (name/description/image).

## Current Alignment Snapshot
**Lean interfaces (card + searchText only):**
- `useProductInterface`
- `useBlogInterface`
- `useJobInterface`
- `useAppInterface`
- `useUserInterface`

**Rich interfaces (card + pill/cell/preview/profile):**
- `usePlacesInterface`
- `useCompanyInterface`
- `useKitchenInterface`

**Profile interfaces (with hydration/secondary media):**
- `useAgentInterface`
- `useProfessionalInterface`

## Fallbacks to Flag (avoid by default)
### Places
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ""`
- Preview defaults:
  - `source: target.source ?? "fireux"`
  - `prop: brand_tagline || short_name || ""`

### Companies
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ""`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? "fireux"`

### Kitchens
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ""`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? "fireux"`

### Jobs
- Subtitle uses only `workplace.short_address` (empty if missing).

### Agent
- Headline/summary fallback chains:
  - `agent_headline || title`
  - `agent_summary || bio_short`
- Placement tags fallback:
  - `agent_placement_types || tags`
- Contact fallbacks:
  - `agent_contact_* || contact_*`

### Professional
- Display name depends on hydrated user (no fallback).
- Title uses `job_title` only (no extra fallback).

## Drift Rules
- Drift managers should behave consistently across entities.
- Dev drift should flag only props that fall outside the canonical shape.

## Product Stack Slice Alignment (Create + Index + Solutions)
Scope reviewed:
- `packages/extensions/fireux-products/src/runtime/components/organisms/entities/Product/Create/System.vue`
- `packages/extensions/fireux-products/src/runtime/components/organisms/entities/Product/Create/Write.vue`
- `packages/extensions/fireux-products/src/runtime/pages/products/index.vue`
- `packages/extensions/fireux-products/src/runtime/components/organisms/entities/Product/Solutions.vue`

### Similarities (already aligned with canon)
- Create flow is deterministic: `handleCreate()` blocks on missing name and gates success/reset on `response.success`.
- Page composition is cleanly layered: index page composes solution entry points + collection manager without hidden data transforms.
- Solution cards map through `useProductInterface().card()` before render, keeping the product view model canon-first.

### Diffs to Flag (align candidates)
- `Create/System.vue`: toast acquisition uses runtime fallback (`globalThis as any`) rather than a canonical composable import.
  - Why align: this introduces interface drift and weak typing for a shared UX primitive.
  - Target: standardize on a single toast access pattern across entity create stacks.
- `Create/System.vue`: `createProduct()` call is not wrapped in `try/finally`.
  - Why align: if `createProduct()` throws, `isCreating` can remain `true` and lock submit UX.
  - Target: canonical async guard pattern (`try/catch/finally`) for all create stack submit handlers.
- `Create/System.vue`: clear action uses browser `confirm(...)`.
  - Why align: native confirm is inconsistent with app UI patterns and hard to theme/localize.
  - Target: use shared modal/confirm UX component pattern used by other stacks.
- `Create/Write.vue`: shipping stage is commented out (`<!-- <ProductCreateShipping /> -->`).
  - Why align: stack stage removal-by-comment creates structural drift and uncertainty about intended order.
  - Target: either remove the stage contract explicitly or gate it via feature/runtime config instead of commented markup.
- `pages/products/index.vue`: two near-duplicate descriptions diverge (`pageDescription` vs `definePageMeta.description`).
  - Why align: copy drift creates avoidable inconsistency across SEO/header metadata.
  - Target: one canonical description source for page header + meta.

### Diffs that look intentional (do not force-align)
- `Solutions.vue` hard-codes solution routing for `fireux-app` and `fireux-template`.
  - Keep if these are contractual core offers with dedicated pages; this is specialization, not accidental drift.
- `Write.vue` runtime-configurable `productKinds` fallback list.
  - Keep as extension/runtime variability; this is expected stack-level configurability.

## Watchlist (48h)
- Product interface + product create/validation paths change frequently; keep `useProductInterface` lean.
- Entity collection managers changed recently; re-validate no new fallback chains were added.

#end

# AI/codex-threads/asset-monitoring.md

# Asset Monitoring — Sizes & Transparency (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-09

Purpose:
- Track asset quality (size, transparency, correct exports) across FireUX apps.
- Record problems and required fixes (e.g., wordmark opacity or background issues).

Scope:
- App assets under `projects/*/public/img/app/` and related references.

Checks (baseline):
- Wordmarks are truly transparent where expected (no opaque matte).
- Export sizes match intended usage (no blurry scaling).
- Light/dark variants exist where required.
- `srcset` uses 2x where needed.

Current Issues:
- FireUX wordmark has opaque background; needs transparent export.

Notes:
- Add per-app findings here (Misebox, Cleanbox, Richies, FireUX).

#end

# AI/codex-threads/bringli.md

# FireUX — Bringli Ecosystem (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and can be deleted on next update.

Status: **Active**
Version: **v3**
Updated: **2026-02-09**

Purpose:
- Track the Bringli ecosystem + app implementation state.
- Keep the remaining Drop/Supplier migration tasks explicit.
- Provide file-level pointers for future edits.

---

## 1. Current Repo State (as of 2026-02-09)

Created and wired:
- Ecosystem package: `packages/ecosystem/fireux-bringli`
- App: `projects/bringli/bringli-app`
- App config uses `modules: ['fireux-drop']` in `projects/bringli/bringli-app/nuxt.config.ts`.
- App dependencies include `fireux-bringli`, `fireux-core`, `fireux-drop`.
- Ecosystem module sets firebase runtime via `setRuntimeFirebaseEcosystem(...)`.

Scaffolding support:
- New generator script: `scripts/create-ecosystem.mjs`

Important config files (Bringli):
- `packages/ecosystem/fireux-bringli/src/config/firebase/ecosystem.config.ts`
- `packages/ecosystem/fireux-bringli/src/config/firebase/service-account.json`
- `projects/bringli/bringli-app/firebase.json`
- `projects/bringli/bringli-app/.firebaserc`

Security note:
- `service-account.json` exists in repo for Bringli. Treat it as placeholder content only. Do not store real secrets in git.

---

## 2. Remaining Work (Still Open)

Drop/Supplier ownership migration:
- Promote `packages/extensions/fireux-drop` from scaffold → supplier domain owner.
- Move Supplier models/composables/components/pages out of:
  - `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/*`
  - `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/*`
  - `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/*`
  - `packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/*`
  - `packages/ecosystem/fireux-misebox/src/runtime/pages/console/supplier/*`
- Leave temporary compatibility wrappers in Misebox for one release cycle.

Bringli verification:
- Confirm Bringli app routes render without route collisions once Drop owns Supplier pages.
- Confirm Drop module runtime defaults are correct for Bringli (`runtimeConfig.public.fireux.drop`).

---

## 3. Naming Decision (Still Open)

Current reality:
- The package is `fireux-drop` (no `fireux-droply` exists).

Decision options:
1. Keep `fireux-drop` as the module name; brand as “Droply” at product level.
2. Rename to `fireux-droply` later (larger migration).

Recommendation:
- Keep `fireux-drop` for now and focus on shipping Supplier ownership.

---

## 4. Firebase Setup Baseline (Bringli)

Baseline requirements:
- Billing: Blaze plan
- Auth: Google, Email/Password, Anonymous
- Region: `europe-west6` (Zurich) for runtime/server defaults
- Hosting: prefer clean site id (no numeric suffix)
- Rules: define Firestore rules before production

---

## 5. Definition of Done (Bringli MVP)

- `fireux-bringli` ecosystem module loads correctly.
- `bringli-app` runs as global app with `fireux-drop` in modules.
- Supplier domain is owned by `fireux-drop`, not Misebox.
- Misebox consumes Drop without breaking existing routes.

#end

# AI/codex-threads/daniel-watson.md

# Daniel Watson — Skills & Positioning (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-09

Purpose:
- Present a clear, sellable snapshot of Daniel Watson’s skills and strengths.
- Grounded in this monorepo’s work and decisions (no invented experience).
- Used to build a CV, portfolio bullets, and outreach messaging.

Scope (source of truth):
- `fireux-mono` repo only (code + docs + decisions).

---

## 1. Positioning (Short)

- Product‑minded full‑stack engineer focused on shipping practical SaaS apps on Firebase/Nuxt.
- Strong in system design, extension architecture, and UI implementation consistency.
- Builds reusable ecosystems and deployable client apps with clear legal/product constraints.

---

## 2. Stack (Evidence in Repo)

- Frontend: Nuxt 3/4, Vue 3, Nuxt UI, SCSS
- Backend: Firebase (Auth, Firestore, Storage), server APIs (Nuxt server routes)
- Payments: Stripe integration (products module)
- Tooling: mono‑repo module architecture, runtime config, dev tooling

---

## 3. Core Strengths (Backed by Work)

- Modular architecture: extensions + ecosystem + app layering
- Canonical data modeling and runtime‑shape discipline
- UI systems: cards/cells/pills + shared utility classes
- Productization: turning systems into sellable, repeatable apps
- Legal‑safe product framing (platform as connector, not employer)

---

## 4. Proof Points (Pull From Repo)

- Designed and maintained FireUX extension system (products, places, jobs, companies, kitchens).
- Implemented shared UI patterns across entities (fx‑card utilities + standardized layouts).
- Built multi‑ecosystem structure: Misebox (hospitality), Cleanbox (services), FireUX core app.
- Tenant app model (e.g., Richie’s) as a real client‑oriented deployment.

---

## 5. CV/Outreach Bullets (Draft‑Ready)

- Built a modular FireUX platform (Nuxt + Firebase) enabling multiple ecosystems and client apps from one codebase.
- Designed canonical data models and runtime shape enforcement across jobs, places, products, and companies.
- Delivered a shared UI system (cards, pills, previews, profiles) with consistent utilities and design rules.
- Shipped production‑style tenant apps with clean configuration, branding, and legal‑safe positioning.
- Integrated Stripe‑ready product modeling and server routes within a shared products extension.

---

## 6. What to Collect Next (For a Stronger CV)

- Deployment proof (live URLs, screenshots, or demo videos).
- Concrete metrics (load time, build time, feature count, number of apps/tenants).
- Client outcomes (e.g., Richie’s app milestones).
- Any public GitHub links (if applicable).

---

## 7. Open Questions (Answer When Ready)

- What roles/titles do you want to target right now?
- Are you open to contract/freelance or only full‑time?
- Which 1–2 live URLs can be shared publicly?

#end

# AI/codex-threads/design-system.md

# FireUX Design System — Codex Thread


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Draft**
Version: **v2**
Updated: 2026-02-09
Previous: v1 (2026-02-05)

This file is a Codex-owned working thread. It is **not canon** and should remain lean.
Promote decisions into GPT chat canon files once stabilized.

---

## 1. Scope (Current Knowledge)

- Nuxt 3 + Nuxt UI are the baseline UI primitives.
- The Richies tenant app is the most recently refined landing surface.
- Components and styles are tuned for clarity, speed, and clean typography.

---

## 2. Visual Language

- Clean, minimal surfaces with strong hierarchy.
- Primary actions are visually prominent and unambiguous.
- Cards and sections are clearly separated with soft dividers or spacing.

---

## 3. Color & Emphasis

- Primary action buttons use a blue brand treatment.
- Secondary actions are lower contrast and less prominent.
- Badges are used for status/metrics and should be compact.

---

## 4. Typography

- Short, confident headlines.
- Body text favors readability with generous line-height.
- Avoid excessive stylization; keep copy direct and scannable.

---

## 5. Layout & Structure

- Landing pages prioritize hero + CTA, followed by benefits, social proof, and FAQ.
- Navigation and footer are intentionally simple.
- Spacing is generous to keep sections breathable.
- Standardize page body spacing via `.pagebody` on `UPageBody` (no local `space-y-*` overrides).
- Global section styles live in `packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/sections.scss` and are imported in `packages/core/fireux-core/src/runtime/assets/styles/main.scss`.

---

## 6. Components in Active Use

- Page/section layout: `UPageCTA`, `UCard`, `USeparator`.
- User/media: `UUser`, `UAvatar`.
- Actions: `UButton` (primary blue), `UBadge`.
- Inputs: `UInput`, `UTextarea`, `USelect`, `UCheckbox`, `UCalendar`, `UPopover`.
- Feedback: toasts for transient confirmations.
- Content disclosure: `UAccordion`.

---

## 7. Motion & Effects

- Subtle background bubble effects are acceptable when soft and low-contrast.
- Motion should never obscure content; keep animation timing gentle.

---

## 8. Brand Assets

- Wordmark assets should use responsive `srcset` to avoid blurriness on mobile.
- Prefer crisp, high-resolution assets with proper sizing.

---

## 9. Accessibility Expectations

- Clear focus states on interactive elements.
- Button labels must be explicit; icons should be decorative unless semantic.
- Maintain readable contrast for primary actions and key text.

---

## 10. Known Implementation Patterns

- CTA buttons include direct actions (e.g., `tel:` for phone).
- Dates formatted using `@internationalized/date` for consistency.
- Keep global styling centralized and reuse Nuxt UI patterns.
- Use `UPageBody` with `class="pagebody"` instead of local `space-y-*` spacing hacks.

---

## 11. Card System (fx-card utilities)

Card styling is moving to shared utility classes in `scss/organisms/cards.scss`.

System rule:
- Card inheritance is linear: Pill → Cell → Preview → Profile (each builds on the previous).

Storage rule:
- Shared styles must live in `packages/core/fireux-core/src/runtime/assets/` (no ad-hoc copies).

Base wrappers:
- `.fx-card` (block, full width)
- `.fx-card--cell` (interactive list row)
- `.fx-card--pill` (compact pill surface)
- `.fx-card--preview` (card with overflow-hidden)
- `.fx-card--profile` (richer profile card surface)

Layout primitives:
- `.fx-card__media`, `.fx-card__content`, `.fx-card__header`
- `.fx-card__stack` with variants `--tight`, `--spaced`, `--loose`
- `.fx-card__badges`, `.fx-card__badge`, `.fx-card__badge--overlay`
- `.fx-card__title`, `.fx-card__title--lg`, `.fx-card__subtitle`, `.fx-card__tagline--empty`

Panels + details:
- `.fx-card__panel`, `--compact`, `__panel-title`, `__panel-value`, `__panel-subtitle`
- `.fx-card__panel-heading`, `.fx-card__detail-grid`, `.fx-card__detail-label`
- `.fx-card__label` (uppercase meta label)

Cover + media:
- `.fx-card__cover`, `__cover-image`, `__cover-gradient`, `__cover-content`
- `.fx-card__cover-title`, `__cover-meta`, `__cover-avatar`, `__cover-badges`

Collections + actions:
- `.fx-card__actions`, `__actions--tight`, `.fx-card__chips`, `.fx-card__gallery`, `__gallery-image`

Utility:
- `.fx-truncate`, `.fx-text-dim`, `.fx-card__icon`

Rule: prefer these classes over one-off Tailwind stacks for entity cards (e.g., Places).

Guidelines:
- Nuxt UI is the default; prefer minimal overrides (“less is more”).
- Local tweaks belong in component-scoped styles, not global utilities.

---

## 12. Open Items

- Formalize token naming (colors, spacing, radii) once stabilized.
- Document canonical component recipes (CTA blocks, hero layouts, testimonials).

#end

# AI/codex-threads/droply.md

# FireUX — Droply Module Thread (Codex)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and can be deleted on next update.

Status: **Active**
Version: **v2**
Updated: **2026-02-09**

Purpose:
- Capture the current state of the Drop/Droply module.
- Track naming decisions and Supplier ownership migration.
- Provide the code-level checklist to move from scaffold → real extension.

---

## 1. Executive Summary

- The module that exists today is `fireux-drop`, not `fireux-droply`.
- `fireux-drop` is still a scaffold: no Supplier domain runtime is implemented yet.
- Supplier domain currently lives in `fireux-misebox`.
- Bringli app already includes `fireux-drop` in `modules`, so the module now has its first consumer.

---

## 2. Naming Reality (`drop` vs `droply`)

Current repo truth:
- Package path: `packages/extensions/fireux-drop`
- Package name: `fireux-drop`
- Module meta name: `fireux-drop`
- Runtime namespace key: `runtimeConfig.public.fireux.drop`
- Config key: `fireuxDrop`

What does **not** exist:
- No `packages/extensions/fireux-droply`
- No `fireux-droply` package import path

Decision options:
1. Keep package as `fireux-drop` and use “Droply” only as product naming.
2. Rename to `fireux-droply` later (larger migration: package names, imports, runtime key, docs).

Recommended for now:
- Keep `fireux-drop` and ship Supplier ownership first.

---

## 3. Current Module Implementation

Core files:
- `packages/extensions/fireux-drop/src/module.ts`
- `packages/extensions/fireux-drop/src/config/module/*.ts`
- `packages/extensions/fireux-drop/README.md`
- `packages/extensions/fireux-drop/package.json`
- `packages/extensions/fireux-drop/registry.json`

Current behavior:
- Registers a standard extension pipeline via `configureFireuxModule(...)`.
- Writes runtime defaults under `public.fireux.drop` using `configureRuntime(..., 'drop')`.
- Ensures runtime layer via `pages-config.ts`.
- Component/composable/layout/model/server hooks exist but are effectively no-op today.

---

## 4. Current Usage

App usage observed:
- `projects/bringli/bringli-app/nuxt.config.ts` includes `modules: ['fireux-drop']`.

Dependency usage observed:
- `projects/bringli/bringli-app/package.json` depends on `fireux-drop`.

No other apps currently list `fireux-drop` in their `modules` or dependencies.

---

## 5. Supplier Domain Ownership (Current vs Target)

Current owner:
- `packages/ecosystem/fireux-misebox`

Supplier domain currently spans:
- Models: `packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/*`
- Composables: `packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/*`
- Components: `packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/*`
- Pages/routes: `packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/*`
- Console: `packages/ecosystem/fireux-misebox/src/runtime/pages/console/supplier/*`

Target owner:
- `packages/extensions/fireux-drop` (Supplier domain should live here)

---

## 6. Next Concrete Steps

1. Implement Supplier runtime in `fireux-drop`:
   - models, composables, components, pages, server
2. Move Supplier assets out of Misebox into Drop.
3. Add temporary compatibility wrappers in Misebox for 1 release cycle.
4. Verify route ownership and runtime config for Bringli + Misebox.

#end

# AI/codex-threads/extensions.md

# FireUX — Extensions Scan (Codex Thread)


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-09

Purpose:
- Compare `packages/extensions/fireux-products` against other extensions.
- Capture inconsistencies/opportunities in the extensions system.
- Keep this practical: conventions we should follow + paper cuts to fix later.

Scope scanned:
- `packages/extensions/fireux-products`
- `packages/extensions/fireux-{blogs,companies,drop,jobs,kitchens,places}`

---

## 1. Baseline Extension Shape (Observed)

Common structure across extensions:
- `package.json` + `registry.json`
- `src/module.ts`
- `src/config/module/*-config.ts` (configure runtime, pages, models, etc.)
- `src/runtime/{components,composables,models,pages,server}`

Every extension is a Nuxt module that:
- Configures runtime defaults (via `configureRuntime` or similar).
- Wires components/composables/models/pages.
- May expose a runtime alias (`#fireux-<ext>`) (currently inconsistent).

---

## 2. fireux-products vs The Pack (What Matches / What Doesn’t)

What matches well:
- Same “configureX” pattern as `fireux-blogs` (runtime buckets + runtime alias).
- Runtime is already split cleanly: models, composables, pages, server.
- Permissions composable mirrors `useBlogPermissions` shape (good consistency).

What diverges (worth noting):
- `src/module.ts` uses `nuxt/kit` imports and declares `NuxtConfig.products`, like `fireux-blogs`/`fireux-drop`.
- Other “core entity” extensions (`places`, `kitchens`, `jobs`, `companies`) use `@nuxt/kit` and `configKey: 'fireuxX'`.
- `configKey` naming is not consistent across the repo:
  - `blogs` → `blogs`
  - `drop` → `drop`
  - `products` → `products`
  - `places/jobs/kitchens/companies` → `fireuxPlaces` / `fireuxJobs` / …
- `fireux-products` ships a Stripe server handler at `packages/extensions/fireux-products/src/runtime/server/api/stripe/create-product.post.ts`,
  but `packages/extensions/fireux-products/src/config/module/server-config.ts` is currently a no-op (Places registers endpoints explicitly).
- Route naming drift: `fireux-blogs` injects route names as `fireux-blog-*` (singular) while others use plural package naming.
- Ecosystem modules now set runtime defaults for `fireux.products` + `fireux.blogs`, and app config can override via module options.

Interpretation:
- There are currently **two module “styles”** in the repo, and `products` aligns with `blogs/drop`.

---

## 3. Job 1 — How We Should Build fireux-products In Line With Others

Recommended “do this next” for `fireux-products` (in order):

1. Make the module “truthy” in docs:
   - Update `packages/extensions/fireux-products/package.json` description (it’s currently TODO).
   - Update `packages/extensions/fireux-products/README.md` from template → real guardrails (what it owns, what it does not).
   - Keep `registry.json` accurate (id/name/team are already fine).

2. Decide which module style we standardize on (don’t bike-shed, just pick):
   - Option A: “domain config keys” (`products`, `blogs`, `drop`) for content-ish modules.
   - Option B: “fireuxX config keys” (`fireuxProducts`, `fireuxBlogs`, …) for everything.
   - Either is fine; the problem today is inconsistency, not the choice.

3. Confirm runtime contract:
   - The Product model is already Firestore-shape oriented (`FirebaseProduct`).
   - It includes Stripe concepts (`prices`, `default_price`, `STRIPE_API_VERSION`), so the module should clearly state:
     - “This package can be used without Stripe enabled, but supports Stripe integration.”
     - Where Stripe lives (`src/runtime/server/stripe/*`).

4. Server surface:
   - Decide whether extension server routes are:
     - explicitly registered (Places model via `addServerHandler`), or
     - layer-discovered (and then verify it once).
   - If we standardize on explicit registration, add Stripe endpoints to `fireux-products` server-config.

5. Page surfaces:
   - Products has runtime pages for `/products`, `/products/create`, `/products/:slug`, `/dev/fireux-products`.
   - The module currently injects only `/products` and `/products/:slug`.
   - This is consistent with `fireux-blogs` (injects only index + slug) and relies on runtime layer inclusion for the rest.
   - If we want “explicit is better”, we should either:
     - Inject all module routes (companies-style), or
     - Stop injecting and rely on runtime layer for all routes.

---

## 4. Job 2 — Inconsistencies / Paper Cuts Across Extensions

### 4.1 Mixed Nuxt Kit Import Style

Observed:
- Some modules use `@nuxt/kit` + `@nuxt/schema`.
- Others use `nuxt/kit` + `nuxt/schema`.
- Some packages even mix styles internally (module uses `nuxt/kit`, config helpers use `@nuxt/kit` types).

Impact:
- Harder to enforce a single template for new extensions.
- Potential for subtle type duplication / “two Resolver types” issues.

### 4.2 Mixed configKey Strategy

Observed:
- `configKey` alternates between plain domain keys and `fireuxX`.

Impact:
- Harder to guess where options live in `nuxt.config.ts`.

### 4.3 Version mismatches

Observed:
- `packages/extensions/fireux-jobs/package.json` is `0.1.0`, but `packages/extensions/fireux-jobs/src/module.ts` advertises `meta.version: 1.0.0`.

Impact:
- Drift smell and upgrade confusion (meta and package should agree).

### 4.4 Module meta compatibility mismatch

Observed:
- `fireux-products` / `fireux-blogs` / `fireux-drop` declare:
  - `compatibility: { nuxt: '^4.0.0' }`
- But their `package.json` peerDependency is `nuxt: ^4.1.0`.

Impact:
- Minor, but it’s drift.

### 4.5 Redundant wiring (copy/paste debt)

Observed:
- `fireux-products`, `fireux-blogs`, `fireux-companies`:
  - `configureComposables(...)` already calls `registerComposablesDir(...)` which calls `addImportsDir(...)`,
  - but module.ts also calls `addImportsDir('./runtime/composables')` again.
- Some modules ensure the runtime layer in both `configurePages(...)` and again inside `register*Pages(...)`.

Impact:
- Not broken, just noisy and makes future module templates harder to keep clean.

### 4.6 Route naming inconsistency

Observed:
- `fireux-blogs` injects route names `fireux-blog-*` (singular),
  while other modules use plural package naming (`fireux-products-*`, `fireux-companies-*`).

Impact:
- Minor, but makes route discovery + grep harder.

### 4.7 Server registration inconsistency

Observed:
- Places explicitly registers API handlers in `packages/extensions/fireux-places/src/config/module/server-config.ts`.
- Products ships `runtime/server/api/stripe/create-product.post.ts`, but `packages/extensions/fireux-products/src/config/module/server-config.ts` is currently a stub.

Impact:
- Hard to predict whether a module’s server surface is “real” without reading multiple files.

### 4.8 Missing TypeScript references

Observed:
- `packages/extensions/tsconfig.json` references most extensions but omits `fireux-companies`.

Impact:
- IDE/build tooling can be inconsistent depending on how references are used.

### 4.9 Template READMEs / TODO descriptions

Observed:
- `fireux-products`, `fireux-blogs`, `fireux-drop` still have template readmes and TODO descriptions.

Impact:
- These modules are easiest to misunderstand and misuse because their docs are not asserting guardrails.

### 4.10 Over-broad peerDependencies (possible)

Observed:
- Several extensions include `stripe` + `h3` + `@vueuse/core` in peerDeps even if the extension doesn’t obviously use them.
  - Example: `fireux-drop` includes `stripe` in peerDeps but currently ships almost no runtime/server logic.

Impact:
- Not a runtime bug, but adds conceptual noise and can complicate upgrades.

---

## 5. Open Questions (Answer When Convenient)

1. Should “content modules” (`blogs/products/drop`) intentionally use domain config keys (`blogs`, `products`, `drop`) while “entities” use `fireuxX`?
2. Do we want a single extension template we follow going forward?
3. Should we tighten peerDeps on thin modules (like `drop`) or keep a “standard peerDeps set” for simplicity?

---

## 6. Active Change Areas (Keep Eyes On)

- Products module wiring + defaults are actively evolving; re-check module template decisions before standardizing.
- Extension workflow guidance is evolving in `docs/copilot-documentation/copilot-instructions/extensions.md`; treat that as the baseline when aligning conventions.

#end

# AI/codex-threads/fireux-misebox.md

# FireUX – Misebox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Purpose

Misebox is a hospitality-focused ecosystem built on FireUX. It configures FireUX Core and modules for kitchens, venues, and hospitality professionals.

Misebox is a connection layer, not an employer or staffing agency.

Primary app:
- `misebox.app` (`projects/misebox/misebox-app`, id: `misebox-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-misebox` (`fireux-misebox`)

## Scope

- Industry: Hospitality, food, kitchens
- Markets: Switzerland / Europe (initial)
- Users: Professionals, kitchens, venues, recruiters

## FireUX Components Used (Configured Today)

From `projects/misebox/misebox-app/nuxt.config.ts`:
- FireUX Core
- Modules: `fireux-places`, `fireux-companies`, `fireux-kitchens`, `fireux-jobs`, `fireux-products`, `fireux-blogs`
- Jobs workplaces config: `['kitchen', 'ship', 'truck']`

## Domain Model (High Level)

- Profile: base identity + professional profile
- Place: kitchens, restaurants, venues as shared entities
- Kitchen: operational entity layered on Places (Misebox-specific)
- Job: listings owned by real employers
- Company: optional operator layer

## Apps in the Ecosystem

Current apps (from `projects/misebox/`):
- `misebox.app` (`id: misebox-app`, role: global, PWA enabled)
- `niederhorn` (`id: niederhorn`, role: tenant, lean modules)

Apps share Core and ecosystem rules. Global apps carry modules; tenant apps stay lean.

## Design Constraints

- Legal-first design
- Profiles over CVs
- Place-based references over free text
- Canonical runtime models as source of truth

## Status

- Ecosystem structure: stable
- Profiles and Places: active
- Jobs: evolving
- UI: Nuxt UI + FireUX design system
- Focus: usable pipelines over completeness

#end

# AI/codex-threads/kitchens.md

# Kitchen Module Handoff (FireUX)

Date: 2026-02-06

## Request Summary
- Brainstorm a FireUX app (non-Misebox) that uses the `fireux-kitchens` module plus default FireUX modules.
- Keep scenarios grounded in existing FireUX modules.
- Provide a handoff of the scenario ideas and a handoff of current modules.

## Scenario Ideas (FireUX + Kitchens + Default Modules)

### 1. Campus Eats — University Dining Ops
- Scenario: A university manages 6 kitchens feeding dorms and events.
- Kitchen module: Recipe scaling, prep schedules, batch production, waste tracking.
- Default modules: `fireux-products`, `fireux-blogs` (baseline), optional `fireux-places`.
- Tie-ins: Kitchen pulls inventory; procurement auto-creates POs; staffing aligns shifts; reporting shows cost per meal plan.

### 2. CareBite — Assisted Living Meal Service
- Scenario: Assisted-living centers with dietary plans and resident preferences.
- Kitchen module: Menu planning with constraints, production runs, tray assembly.
- Default modules: `fireux-products`, `fireux-blogs` (baseline), optional `fireux-companies` for vendor/provider entities.
- Tie-ins: CRM-like profiles connect to menus; compliance logs cooking temps; staffing aligns to prep/serve windows.

### 3. EventWorks — Caterer + Venue Operator
- Scenario: A venue runs weddings and corporate events weekly.
- Kitchen module: Event menus, batch prep, timing/runner workflows.
- Default modules: `fireux-products`, `fireux-blogs` (baseline), optional `fireux-places`.
- Tie-ins: Booking confirms headcount; kitchen auto-scales recipes; inventory forecasts; finance ties food cost to event margin.

### 4. FreshFleet — Ghost Kitchen Delivery Network
- Scenario: Multi-brand ghost kitchens with delivery across a city.
- Kitchen module: Station management, cook times, quality checks.
- Default modules: `fireux-products`, `fireux-blogs` (baseline), optional `fireux-places`.
- Tie-ins: Orders route to stations; kitchen updates ETA; inventory decrements per recipe; ops console monitors throughput.

### 5. MarketMade — Grocery + Prepared Foods
- Scenario: A grocery chain with daily hot/cold prepared foods.
- Kitchen module: Daily production plan, SKU yield tracking.
- Default modules: `fireux-products`, `fireux-blogs` (baseline), optional `fireux-places`.
- Tie-ins: POS sales inform tomorrow’s production; kitchen logs waste; inventory reorders ingredients.

## Current FireUX Modules (Repo Canon)

Source: `AI/chatcontext-2026-02-06.md` (Section 3.2 Ecosystem baseline)

### Core Modules (internal-only plumbing)
- `fireux-core`
- `fireux-ecosystem-controller`
- `fireux-nuxtfire`

### Baseline Modules (default in `fireux-fireux` ecosystem)
- `fireux-products`
- `fireux-blogs`

### Opt-in Modules (per ecosystem/app)
- `fireux-places` (physical-world bias)
- `fireux-companies` (opinionated; promote to baseline only when mature)
- Domain-heavy extensions (examples):
  - `fireux-jobs`
  - `fireux-kitchens`
  - `fireux-drop`

## Notes / Next Steps
- If you want a single scenario expanded into a full spec (roles, objects, flows, screens), pick one and I’ll draft it.
- If the current module list has changed, point me to the updated source and I’ll refresh this handoff.

## Soon
- Decide which scenario is the anchor for the kitchen module (pick 1).
- Confirm the exact default module set to assume for new apps.

## Immediate (FireUX + Kitchens + Kitchens Deps Only)
- FireUX core plumbing: `fireux-core`, `fireux-ecosystem-controller`, `fireux-nuxtfire`
- FireUX baseline modules: `fireux-products`, `fireux-blogs`
- Kitchen module: `fireux-kitchens`
- Kitchen module dependency: `fireux-core` (workspace)
- Kitchen module peer deps:
  - `nuxt` `^4.1.0`
  - `@nuxt/kit` `^4.1.0`
  - `@nuxt/schema` `^4.1.0`
  - `vue` `^3.5.20`
  - `vue-router` `^4.5.0`
  - `vuefire` `^3.2.2`
  - `firebase` `^11.10.0`
  - `firebase-admin` `*`

## Future
- Draft a full spec for the chosen scenario (roles, objects, flows, screens).
- Map kitchen module data models to FireUX defaults and opt-in modules.
# Kitchens Module — Concepts & Handover (2026-02-07)

Purpose: capture current kitchen-module intent so we can align product copy, roadmap, and build scope.

Core idea (current)
- Kitchen module is not “hospitality branding”; it is operational kitchen tooling.
- Primary focus is back‑of‑house workflows: receiving, menu creation, recipes, mise en place, ingredient stock, and station workflow.
- It should support touch‑friendly order processing in a kitchen environment.

Key capability themes
- Menu creation and management (structure, pricing, availability).
- Recipe + ingredient management (BOM, stock awareness).
- Mise en place tasks and prep checklists.
- Order processing and station routing (line, pass, prep stations).
- Inventory and ordering support (ingredients, suppliers).
- Kitchen tools/operations (open/close diary, health & safety records, training).

Chef profiles
- We moved chef profiles from Misebox to Kitchens (routes stay under `apps/{appId}/chefs`).
- Chef profile should be a first‑class part of Kitchens.

Product messaging direction
- “Kitchen operations pages and consoles.”
- “Menus, ingredients, mise, team, costs.”
- Emphasize operational control and consistency (not just branding).

Roadmap framing (for modules/[id])
- Now: kitchen profile + menus/ingredients/mise/team/costs sections.
- Next: prep lists, inventory workflows, station tools.
- Later: touch‑friendly order handling + integrations.

Open questions
- Do we want orders to be a formal entity now, or just a simple station board?
- How deep should inventory go (full stock system vs lightweight ingredient list)?
- Are supplier order workflows part of Kitchens or a future add‑on?

## Canon Decision — Ingredient Identity (2026-02-07)

Rule
- Ingredient identity is named by kitchen usage, not by supplier naming and not by biological taxonomy.
- If kitchens prep it differently, order it separately, or cost it differently, it is a different ingredient.

Implications
- `Tomato` and `Cherry tomato` are different ingredients.
- Supplier SKUs do not define ingredient identity.
- Supplier products map to ingredients; ingredients do not derive from supplier products.

Modeling guardrails
- Do not implement parent/child ingredient trees.
- Do not auto-generate ingredients from supplier catalogs.
- Keep ingredient names canonical and stable for recipe and costing consistency.

Practical stop rule
- If a kitchen would substitute it without renaming the dish, keep it as the same ingredient.
- If substitution is intentional and meaningfully changes prep/behavior (fresh vs canned, cherry vs chopped), split it.

# AI/codex-threads/monorepo-install-incident.md

# Monorepo Install Incident (2026-02-06)

## Summary

- `pnpm dev:*` commands failed with `sh: nuxi: command not found`.
- `pnpm install` was leaving a partial install and failing in workspace `postinstall`.
- Impact was monorepo-wide (not only `fireux-app`).

## Root Causes

- Network/DNS failures to npm registry during reinstall created partial dependency state.
- Workspace `postinstall` scripts ran `nuxi prepare` in full runtime mode.
- Some apps/templates require env vars (for example `APP_DOMAIN`) at config load time, so `postinstall` could fail and break the whole install.

## Fix Applied

- Updated app `postinstall` scripts to run `nuxi prepare` with `CI=1` in the child process:

```json
"postinstall": "node -e \"if(process.env.CI||process.env.GITHUB_ACTIONS) process.exit(0); require('child_process').execSync('nuxi prepare',{stdio:'inherit',env:{...process.env,CI:'1'}});\""
```

- This keeps type generation in place while skipping strict runtime env requirements during install.

## Files Updated

- `projects/cleanbox/cleanbox-app/package.json`
- `projects/cleanbox/richies-reinigung/package.json`
- `projects/fireux/fireux-app/package.json`
- `projects/fireux/tenant/package.json`
- `projects/misebox/misebox-app/package.json`
- `projects/misebox/niederhorn/package.json`

## Verification

```bash
pnpm install
pnpm -r --filter './projects/*/*' exec nuxi --version
pnpm dev:fireux --host
pnpm dev:misebox --host
```

Expected:

- Install completes successfully.
- Each app resolves `nuxi` correctly.
- Dev servers boot normally.

## Guardrails

- Any new Nuxt app in this monorepo should use the same `postinstall` pattern.
- Avoid requiring production runtime env vars during install-time `nuxi prepare`.
- Treat registry/DNS errors and postinstall env failures as separate incident classes.

# AI/codex-threads/onboarding.md

# Onboarding Thread (New)

Goal: simplify onboarding so it works the same whether run locally (developer/machine) or in the browser (client).

Key decisions
- Onboarding lives at `/onboarding` and is the single entry point.
- Product pages (`/products/[slug]`) are marketing-only.
- Module pages (`/modules/[id]`) are marketing-only.
- Onboarding pulls from the same product objects in Firestore (no separate module registry).

Open questions
- Should onboarding be admin-only or public?
- Should onboarding be scoped by appId/tenant automatically or selectable?
- Do we need a short onboarding “mode” selector: local vs browser?

Next steps
- Define the minimal onboarding steps that are the same in both modes.
- Define which steps diverge (e.g., asset upload to Firestore vs local file paths).
- Decide where onboarding progress is stored (Firestore vs local storage vs both).

# AI/codex-threads/packages.md

# FireUX — Packages Map (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-09

Purpose:
- Quick, code-level map of the FireUX package layers.
- Point to the exact folders where edits should land.
- Track new ecosystems/apps as they arrive.

---

## 1. Core Layers (Where Things Live)

Core platform:
- `packages/fireux-core` (shared config, runtime helpers, app/ecosystem wiring)

Extensions (shared domains/features):
- `packages/extensions/fireux-*` (blogs, products, jobs, kitchens, places, drop, etc.)
- Extensions are Nuxt modules with runtime layers.

Ecosystems (branding + ecosystem wiring):
- `packages/ecosystem/fireux-*` (per-ecosystem module + firebase config)

Apps (deployable projects):
- `projects/<ecosystem>/<app-name>`
- Each app uses `defineFireuxConfig(...)` in `nuxt.config.ts`.

---

## 2. Current Ecosystem Packages (as of 2026-02-09)

- `packages/ecosystem/fireux-fireux`
- `packages/ecosystem/fireux-cleanbox`
- `packages/ecosystem/fireux-misebox`
- `packages/ecosystem/fireux-bringli` (new)

---

## 3. Current Apps (Representative)

Global apps:
- `projects/fireux/fireux-app`
- `projects/cleanbox/cleanbox-app`
- `projects/misebox/misebox-app`
- `projects/bringli/bringli-app` (new)

Tenant/secondary apps (examples):
- `projects/fireux/fireux-tenant`
- Other tenant apps live under their ecosystem folders.

---

## 4. New Ecosystem Scaffolding

Script added for consistency:
- `scripts/create-ecosystem.mjs`

Expected outputs:
- `packages/ecosystem/fireux-<name>`
- `projects/<name>/<name>-app`
- `tsconfig.base.json` path aliases + `packages/ecosystem/tsconfig.json` refs

Use the script for new ecosystems unless there is a deliberate deviation.

---

## 5. Small Guardrails

- New ecosystem modules should set runtime defaults via `setRuntimeFirebaseEcosystem(...)`.
- Every new package must be added to the relevant TS config references.
- Keep app `modules` list explicit in `nuxt.config.ts` to avoid accidental runtime drift.

#end

# AI/codex-threads/product-fulfillment.md

# Product Fulfillment Thread Handoff

This thread is now scoped to **post-purchase fulfillment** only.

## Scope
- App onboarding and fulfillment checklists
- Asset collection and validation
- Build/review/launch fulfillment flow
- Local-first vs Firestore-first ingestion

## Out of Scope (handled in products/stripe thread)
- Stripe setup and debugging
- Product creation UX and defaults
- Multi-create starter actions
- Stripe ID persistence rules

## Current separation rule
- `products` thread: create/sell/charge.
- `product-fulfillment` thread: deliver/build/launch.

# AI/codex-threads/products.md

# FireUX — Products & Revenue (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-09

Purpose:
- Define what we can sell and how to keep scope cash-first.
- Grounded in current repo reality (no invented features).

Primary context docs:
- `AI/gpt-chats/fireux-app.md`
- `AI/gpt-chats/fireux-fireux.md`
- `AI/gpt-chats/cleanbox-app.md`
- `AI/gpt-chats/misebox-app.md`
- `AI/gpt-chats/richies.md`

---

## 1. Current Reality
- Cash constraint is the driver: we need revenue soon.
- We sell working apps, not FireUX as an abstract platform.
- FireUX exists to ship/sell repeatable apps without burnout.

## 2. FireUX Sales Menu (Simple)
1. Branded business apps (primary)
2. Ecosystem memberships
3. Dedicated apps inside an ecosystem
4. White-label apps (later)
5. Custom client apps (controlled)
6. Paid add-ons (later)
7. Setup/onboarding services
8. Support/maintenance plans
9. Digital products (later)

## 3. Focus Cut (Next 3–6 Months)
- Anchor: Richie’s (real client app).
- Push: Cleanbox (fewer roles, clearer buyer).
- Keep Misebox slow and deliberate.
- Pricing: one setup fee + one monthly subscription.

## 4. FireUX App Role (Do Not Overbuild)
- FireUX app is a credibility surface, not the product.
- No pricing pages or consoles unless a sale forces it.
- Repo truth: `projects/fireux/fireux-app/nuxt.config.ts` uses `fireux-products` + `fireux-blogs`.

## 5. Product Module Reality (Current Code)
- Product defaults are currently oriented around a FireUX App offer.
- Create flow defaults live in:
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/state/useCreateProductState.ts`
  - `packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/Prices/useCreatePricesState.ts`
- Stripe create endpoint exists at:
  - `packages/extensions/fireux-products/src/runtime/server/api/stripe/create-product.post.ts`

## 6. Ecosystem Baseline
- `fireux-fireux` baseline modules: `fireux-products`, `fireux-blogs`.
- Other extensions are opt-in by ecosystem/app.

#end

# AI/gpt-chats/cleanbox-app.md

# cleanbox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Overview

`cleanbox.app` is the main application of the Cleanbox ecosystem. It is a reusable service-business app built on FireUX.

App identity (from `projects/cleanbox/cleanbox-app/nuxt.config.ts`):
- `id: cleanbox-app`
- `name: Cleanbox`
- `role: global`

Repo location:
- `projects/cleanbox/cleanbox-app`

## Purpose

- Global Cleanbox app shell (Cleanbox ecosystem)
- Template base for Cleanbox tenant apps (example: Richie’s)
- Landing-first surface (current implementation)

## Technical Stack

- Nuxt 3
- Firebase
- FireUX Core
- Minimal module surface

Configured modules (current):
- `fireux-products`
- `fireux-blogs`

## Core Features

- Landing page for the Cleanbox concept (`app/pages/index.vue`)
- Reusable landing components (hero/solutions/quick-peek)
- Routes referenced by CTAs are not yet scaffolded (see `docs/gap.md`)

No marketplace logic. No job matching.

## UX Philosophy

- Simplicity first
- Fast load
- Clear actions
- Minimal configuration

## Role in FireUX

- Template base
- Subscription product
- Starting point for client work

## Status

- Active
- Base for Richie’s app
- Evolving slowly and deliberately

#end

# AI/gpt-chats/fireux-app.md

# fireux-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Overview

`fireux-app` is the primary application of the FireUX ecosystem.

App identity (from `projects/fireux/fireux-app/nuxt.config.ts`):
- `ecosystem: fireux`
- `id: fireux-app`
- `name: FireUX`
- `role: global`

Repo location:
- `projects/fireux/fireux-app`

## Technical Stack

- Nuxt 3
- Firebase
- FireUX Core

Configured modules (current):
- `fireux-products`
- `fireux-blogs`

## Recent Changes (2026-02-09)

- Apps and ecosystems index pages were updated in repo to reflect the expanding ecosystem list (including Bringli).
- Module list remains `fireux-products` + `fireux-blogs`.

## Current Scope

- Lean, first-party FireUX app shell
- Used for FireUX-branded surfaces and module-driven pages

#end

# AI/gpt-chats/fireux-cleanbox.md

# FireUX – Cleanbox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Purpose

Cleanbox is a service-industry ecosystem built on FireUX, parallel to Misebox but focused on cleaning and local services. It exists to prove FireUX works across industries.

Primary app:
- `cleanbox.app` (`projects/cleanbox/cleanbox-app`, id: `cleanbox-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-cleanbox` (`fireux-cleanbox`)

## Scope

- Industry: Cleaning and local services
- Users: Cleaning companies, operators, staff (future)
- Not marketplace-first

## Core Differences vs Misebox

- Company-centric, not professional-centric
- Fewer roles
- Less abstraction
- Faster conversion focus

## FireUX Components Used

- FireUX Core
- Global app modules (current): `fireux-products`, `fireux-blogs`

No jobs marketplace by default.

## Domain Model (Direction)

- Company as central entity
- Owner or admin profile
- Place for business location and service areas

Note: this is the intended framing; the current global app config only enables `fireux-products` and `fireux-blogs`.

## Apps in the Ecosystem

- `cleanbox.app` (`id: cleanbox-app`, role: global)
- Client-specific tenant apps (example: `richies-reinigung`)

Each app is single-company focused and uses FireUX primitives.

## Strategic Role

- Grounds FireUX in real businesses
- Prevents over-abstraction
- Acts as template and SaaS proof

## Status

- Ecosystem structure: stable
- Used to validate pricing and scope
- Actively influencing FireUX decisions
- `cleanbox.app` is currently landing-first; many operational routes referenced by CTAs are not yet scaffolded.

#end

# AI/gpt-chats/fireux-fireux.md

# FireUX – FireUX Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Purpose

The FireUX ecosystem is the first-party FireUX-branded ecosystem. It provides branding, configuration, and ecosystem wiring used by FireUX apps.

Primary app:
- `fireux-app` (`projects/fireux/fireux-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-fireux` (`fireux-fireux`)

## Scope

- Industry: FireUX platform + first-party apps
- Audience: FireUX users, developers, and demos

## FireUX Components Used (Configured Today)

From `projects/fireux/fireux-app/nuxt.config.ts`:
- FireUX Core
- Modules: `fireux-products`, `fireux-blogs`

## Apps in the Ecosystem

Current apps (from `projects/fireux/`):
- `fireux-app` (global)
- `fireux-tenant` (tenant, intentionally lean)

## Status

- Ecosystem package exists and is stable
- Global app config is lean (products + blogs)

#end

# AI/gpt-chats/fireux-misebox.md

# FireUX – Misebox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Purpose

Misebox is a hospitality-focused ecosystem built on FireUX. It configures FireUX Core and modules for kitchens, venues, and hospitality professionals.

Misebox is a connection layer, not an employer or staffing agency.

Primary app:
- `misebox.app` (`projects/misebox/misebox-app`, id: `misebox-app`, role: `global`)

Ecosystem package:
- `packages/ecosystem/fireux-misebox` (`fireux-misebox`)

## Scope

- Industry: Hospitality, food, kitchens
- Markets: Switzerland / Europe (initial)
- Users: Professionals, kitchens, venues, recruiters

## FireUX Components Used (Configured Today)

From `projects/misebox/misebox-app/nuxt.config.ts`:
- FireUX Core
- Modules: `fireux-places`, `fireux-companies`, `fireux-kitchens`, `fireux-jobs`, `fireux-products`, `fireux-blogs`
- Jobs workplaces config: `['kitchen', 'ship', 'truck']`

## Domain Model (High Level)

- Profile: base identity + professional profile
- Place: kitchens, restaurants, venues as shared entities
- Kitchen: operational entity layered on Places (Misebox-specific)
- Job: listings owned by real employers
- Company: optional operator layer

## Apps in the Ecosystem

Current apps (from `projects/misebox/`):
- `misebox.app` (`id: misebox-app`, role: global, PWA enabled)
- `niederhorn` (`id: niederhorn`, role: tenant, lean modules)

Apps share Core and ecosystem rules. Global apps carry modules; tenant apps stay lean.

## Design Constraints

- Legal-first design
- Profiles over CVs
- Place-based references over free text
- Canonical runtime models as source of truth

## Status

- Ecosystem structure: stable
- Profiles and Places: active
- Jobs: evolving
- UI: Nuxt UI + FireUX design system
- Focus: usable pipelines over completeness

#end

# AI/gpt-chats/fireux-tenant.md

# fireux-tenant


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Planned**
Version: **v1**
Updated: 2026-02-09

## Overview

`fireux-tenant` is a tenant-mode app in the FireUX ecosystem intended as a sandbox for testing and experimentation.

App identity (from `projects/fireux/tenant/nuxt.config.ts`):
- `ecosystem: fireux`
- `id: fireux-tenant`
- `name: FireUX Tenant`
- `role: tenant`

Repo location:
- `projects/fireux/tenant`

## Current Config

Configured modules (current):
- None (`modules: []`)

## Intended Use

- Safe place to test new modules, UI surfaces, and flows without impacting `fireux-app`.
- Keep lean; only enable modules when a specific test requires them.

#end

# AI/gpt-chats/fireux.md

# FireUX Project — AI Working Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v2**
Updated: 2026-02-09
Previous: v1 (2026-02-04)

This file defines how ChatGPT should behave inside the **FireUX Project**.

FireUX is a mature, opinionated system.
This project space is for **execution, alignment, and shipping**.

---

## Latest Changes (2026-02-09)

- New ecosystem + app added: Bringli (`packages/ecosystem/fireux-bringli`, `projects/bringli/bringli-app`).
- Bringli app is the first consumer of `fireux-drop`.
- New scaffolding script: `scripts/create-ecosystem.mjs` for future ecosystems/apps.

---

## 1. FireUX School vs FireUX Project

There are **two distinct ChatGPT project spaces**:

### FireUX School
- Learning
- Exploration
- Experiments
- Dead ends
- Overthinking
- Historical context
- “Why did we do this?”
- Recovery of ideas if stuck

FireUX School is **always available as a fallback**.
If something feels unclear or missing, we may intentionally return there.

---

### FireUX Project (this space)
- Canonical decisions
- Implementation
- Refinement
- Shipping
- Reducing scope
- Saying “no” to ideas

**FireUX Project assumes maturity.**
We do not relitigate fundamentals here unless explicitly requested.

---

## 2. Core Behaviour Rules for ChatGPT

When working in FireUX Project, ChatGPT must:

1. **Be decisive**
   - Prefer clear recommendations over endless options
   - Default to the simplest viable solution

2. **Protect velocity**
   - Avoid unnecessary abstraction
   - Avoid re-explaining concepts already decided

3. **Respect canon**
   - If a decision exists, follow it
   - If unclear, ask once and move on

4. **Detect misplaced conversations**
   - Explicitly say so
   - Suggest moving to the correct dedicated chat
   - Optionally propose the name of that chat

5. **Encourage clean chat boundaries**
   - One chat = one responsibility
   - Do not allow long-term conceptual drift

---

## 3. Canonical Chat Structure (FireUX Project)

FireUX Project is organized as **dedicated long-lived chats**, similar to folders.
If a conversation drifts outside its scope, ChatGPT should recommend switching chats.

### Canonical Chats

#### 00 — FireUX Canon
- Philosophy
- Laws
- Naming rules
- UX principles
- Legal framing
- “Never again” rules

_No debugging or experiments._

---

#### 01 — Architecture & Structure
- Monorepo layout
- Core / Extensions / Ecosystems / Apps
- Firestore structure
- Auth & roles
- Data ownership
- SSR vs client decisions

---

#### 02 — Data Models & Canon Objects
- Runtime models
- Firestore shapes
- Required vs optional fields
- Drift rules
- Versioning

Models are defined here **before** implementation.

---

#### 03 — Edit Systems & Forms
- Preview → Edit → Confirm flows
- Draft-first logic
- ObjectArray systems
- Save / cancel semantics
- Permissions and editability

---

#### 04 — UI Surfaces
- Cards
- Cells
- Pills
- Hydration rules
- Visibility rules
- Cross-domain consistency

No styling bikeshedding.

---

#### 05 — Domains: Jobs
- Job model
- Roles (Professional / Agent / Employer)
- Apply flow
- Job lifecycle
- Legal-safe wording

---

#### 06 — Domains: Places
- Place creation
- Google ingestion rules
- Claiming
- Image rules
- Place relationships

---

#### 07 — Domains: Companies
- Company profiles
- Admins & claims
- Ownership vs management
- Consoles
- Links to places & jobs

---

#### 08 — Domains: People & Profiles
- Profiles
- Public vs private data
- Shareable business cards
- Visibility rules

---

#### 09 — Consoles & Navigation
- Entry points
- CTAs
- Empty states
- Ecosystem vs app consoles

---

#### 10 — Dev Tooling & Health
- Drift detection
- Dev panels
- Debug helpers
- Logging
- Dev-only vs shipped tooling

---

#### 11 — Migration & Decisions Log
- What changed
- Why it changed
- What was dropped
- References back to FireUX School

---

#### 12 — Release & Shipping
- MVP definition
- Cut lines
- Deployment rules
- Post-ship iteration

No theory — only reality.

---

## 4. Misplacement Protocol

If ChatGPT detects that:
- The topic is too exploratory
- The discussion is philosophical rather than executable
- The user is unsure or stuck conceptually

Then ChatGPT should:
1. Say so explicitly
2. Recommend moving to the correct FireUX Project chat or temporarily switching to FireUX School
3. Explain why the move helps velocity

---

## 5. Default Assumptions

Unless explicitly overridden:
- FireUX is legal-safe by design
- FireUX is a listing / connecting platform, not an employer
- Simplicity beats flexibility
- Shipping beats elegance
- Fewer concepts > clever abstractions

---

## 6. AI Context System (Repo-Local)

FireUX uses a repo-local AI system for shared context.

Root folder:
- `AI/`

Subfolders:
- `AI/gpt-chats/` = canonical docs for GPT chats (this file lives here)
- `AI/codex-threads/` = Codex-specific working threads
- `AI/copilot-chats/` = reserved for Copilot context (empty for now)

Rules:
- Canon lives in `AI/` to be visible to all assistants.
- Each canon file is versioned (`*-v2.md`, `*-v3.md`, etc.).
- New versions are created only when real changes occur.

---

## 7. Final Principle

FireUX Project exists to **finish the work**.

If something:
- Slows momentum
- Reopens settled debates
- Exists only to explain rather than enable

It should be questioned, reduced, or removed.

FireUX School still exists — we are not losing knowledge.
We are protecting execution.

#end

# AI/gpt-chats/jobs.md

# FireUX Jobs — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Stable**
Version: **v2**
Updated: 2026-02-09
Previous: v1 (2026-02-04)

This file defines the **canonical scope, rules, and relationships** for the `fireux-jobs` extension.

Jobs is a **shared cross-ecosystem package** used by:
- Misebox (hospitality)
- Cleanbox (cleaning)
- Future FireUX ecosystems

Jobs is **not tenant-specific** and must remain ecosystem-agnostic.

---

## 1. What Jobs Is (and Is Not)

### Jobs IS
- A **listing and matching system**
- A connector between **real employers** and **real people**
- A shared workspace across ecosystems
- A package that owns job listings, visibility, and application flows

### Jobs IS NOT
- An employer
- A staffing agency
- A payroll system
- A contract issuer

FireUX must always remain **legally neutral**.

---

## 2. Core Roles in Jobs

Jobs always involves **three distinct roles**:

### Employer (external truth)
- The real-world employer
- Represented by a Company and/or Place
- Never FireUX itself
- Must be referenced on every job

Jobs always record:
- `company_id`

Workplace references are stored as:
- `workplace_type`
- `workplace_id`
- `workplace_label`

---

### Agent (posting authority)
- A **profile type owned by fireux-jobs**
- The identity allowed to post and manage jobs
- Represents the employer on the platform

Key rules:
- Jobs are posted **by Agents**
- Permissions are tied to having an Agent profile
- Agents may act on behalf of companies or places
- FireUX never auto-creates Agents

Canonical permission logic:
- `canPostJob === hasAgentProfile`

---

### Professional (candidate)
- A **profile type owned by fireux-jobs**
- Reusable across ecosystems (Misebox, Cleanbox, etc.)
- Represents the worker / applicant

Key rules:
- Professionals browse and apply to jobs
- Professional profiles are ecosystem-aware but portable
- Jobs never store copies of Professional data

---

## 3. Canonical Data Ownership

### Jobs Collection
Firestore:
```
jobs/{jobId}
```

Jobs own:
- Job metadata (title, description, status)
- References to employer entities
- Lifecycle state

Jobs never own:
- Employer identity truth
- Professional profile data
- Agent profile data

---

### Profiles Owned by Jobs

The Jobs package owns two profile types:

#### Agent
- Core document: `agents/{uid}`
- App overlay: `apps/{appId}/agents/{uid}`
- Identity + permissions + contact info

#### Professional
- Core document: `professionals/{uid}`
- App overlay: `apps/{appId}/professionals/{uid}`
- Skills, experience, certifications, languages

Profiles are **shared infrastructure**, not app-specific inventions.

---

## 4. Canonical Job Model (Runtime)

The Job model mirrors **stored Firestore shape only**.

Rules:
- No UI fields
- No computed fields
- No nested optional objects
- Empty string means “unset”

Runtime model (source of truth):

```ts
export const Job = {
  id: '' as string,

  // Ownership
  company_id: '' as string,

  // Workplace (v2)
  workplace_type: '' as string,
  workplace_id: '' as string,
  workplace_label: '' as string,

  // Product layer
  job_type: 'permanent' as JobType,

  // Hiring intent
  openings_count: 1 as number,

  // Pay
  pay_currency: 'CHF' as string,
  pay_rate: 0 as number,
  pay_unit: 'hour' as JobPayUnit,

  // Time window (optional by value)
  start_at: {} as FirebaseTimestamp,
  end_at: {} as FirebaseTimestamp,

  // Content
  title: '' as string,
  description: '' as string,

  // Lifecycle
  status: 'open' as JobStatus,

  // Auth
  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const
```

---

## 5. Workplace (v2 Decision)

### 5.1 The Key Change

Jobs **no longer reference kitchens directly**.
Instead, Jobs reference a **workplace** via:
- `workplace_type`
- `workplace_id`
- `workplace_label`

This enables reuse across ecosystems:
- Misebox (kitchens)
- Cleanbox (houses, offices)
- Logistics (trucks, ships, warehouses)

### 5.2 Legacy Handling

Legacy jobs with `kitchen_id` are resolved at read time.
The canonical model remains workplace-only.

---

## 6. Job Types (Product Layer)

```ts
type JobType =
  | 'einsatz'     // short-term / cover shift
  | 'misebox'     // platform-managed deployment
  | 'fixed'       // fixed-term contract
  | 'permanent'   // ongoing role
```

Rules:
- Affect product logic only
- Do not affect storage shape

---

## 7. JobResolved (Read-Time Only)

```ts
export type JobResolved = Job & {
  workplace?: unknown | null
}
```

Notes:
- `workplace` is never stored
- Type depends on ecosystem
- Misebox resolves workplace → Kitchen

---

## 8. Job Interface Rules (UI Mapping)

The interface layer maps **JobResolved → UI card**.

Rules:
- Do not invent missing data
- No synthetic subtitles
- No implicit address fallbacks
- If data is missing, it stays missing

---

## 9. Ecosystem Usage

### Misebox (current working context)
- Hospitality jobs
- Kitchens, restaurants, venues
- Early-stage usage with personal profiles and friends
- Competitive reference: Coople (market comparison only)

### Cleanbox
- Cleaning and facilities jobs
- Same job mechanics, different domain language
- No divergence in core Jobs logic

Rule:
> Ecosystems may customize **presentation**, never **core job logic**.

---

## 10. Job Lifecycle (Canonical)

Minimal, explicit states only:
- `open`
- `closed`

No hidden states.
No complex pipelines (for now).

---

## 11. Permissions & Safety

- Only Agents can create or manage jobs
- Professionals can view and apply
- Jobs always reference a real employer entity
- FireUX never appears as employer in UI or data

Language rules:
- Use “list”, “connect”, “apply”
- Avoid “hire”, “employ”, “contract”

---

## 12. Relationship to FireUX School

Historical context, experiments, and alternative designs live in **FireUX School**.

If:
- Job complexity grows unexpectedly
- Legal framing becomes unclear
- Roles feel overloaded

Then we may **pause and consult FireUX School** — but decisions land here.

---

## 13. Non‑Goals (Explicit)

Jobs will NOT:
- Handle payroll
- Handle contracts
- Mediate disputes
- Guarantee work
- Perform background checks

These are outside FireUX’s scope.

---

## 14. Final Principle

Jobs must remain:
- Simple
- Legally safe
- Ecosystem-agnostic
- Role-explicit

If complexity appears, it must be:
1. Justified by real usage
2. Explicitly added
3. Canonized here

Otherwise, it does not ship.

#end

# AI/gpt-chats/misebox-app.md

# misebox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Overview

`misebox.app` is the primary application of the Misebox ecosystem. It is the real product, not a demo or template.

App identity (from `projects/misebox/misebox-app/nuxt.config.ts`):
- `id: misebox-app`
- `name: Misebox`
- `role: global`

Repo location:
- `projects/misebox/misebox-app`

## Role in the System

- Exposes profiles
- Hosts job listings
- Connects professionals to opportunities
- Demonstrates the full Misebox value proposition

## Technical Stack

- Framework: Nuxt 3
- UI: Nuxt UI + FireUX design system
- Backend: Firebase (Auth, Firestore, Storage)
- Architecture: FireUX Core + modules
- PWA: Yes

Configured modules (current):
- `fireux-places`
- `fireux-companies`
- `fireux-kitchens`
- `fireux-jobs` (workplaces: `['kitchen', 'ship', 'truck']`)
- `fireux-products`
- `fireux-blogs`

## Core Features

- Profiles: base + professional, structured and live
- Experience: place-based entries, draft-first edit model
- Jobs: employer-owned listings, applications routed directly
- Places: Google-backed place entities, claimable, shared

## UX Principles

- Draft → save → confirm
- Preview + edit panels
- Minimal abstraction visible to users

## Constraints

- Legal safety over convenience
- Real-world entities only
- Avoid speculative features

## Status

- Actively developed
- Reference app for ecosystem decisions
- Drives many FireUX architectural choices

#end

# AI/gpt-chats/places.md

# FireUX Places — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Stable**
Version: **v2**
Updated: 2026-02-09
Previous: v1 (2026-02-04)

This file defines the **canonical scope, rules, and responsibilities** for the `fireux-places` extension.

Places is a **shared cross-domain infrastructure package** used by:
- Jobs
- Companies
- Kitchens
- Venues
- Future FireUX domains

Places must remain **foundational, neutral, and boring**.

---

## 1. What Places Is (and Is Not)

### Places IS
- A **canonical real-world location layer**
- A system for deduplicating physical locations
- A shared reference used by many domains
- A long-lived truth source for addresses and geography

### Places IS NOT
- A business profile
- A company identity
- A job posting
- A content system

A Place answers: **“Where is this?” — nothing more.**

---

## 2. Canonical Identity

### Stable IDs
- Every Place has a stable `id`
- When sourced from Google, this is the **Google Place ID**
- This prevents duplicates across tenants and apps

Rule:
> One real-world location = one Place document.

---

## 3. Data Ownership

### Places Collection
Firestore:
```
places/{placeId}
```

Places own:
- Address & formatted address
- Geo coordinates (lat/lng)
- Country / region
- Basic contact fields
- Place image & image shade
- Source metadata

Places do NOT own:
- Business logic
- Employment data
- Ownership or admin rights
- Domain-specific metadata

---

## 4. Relationship to Other Domains

Places are **always referenced**, never embedded.

### Jobs
- Jobs reference Places to indicate work location
- Jobs never copy address or geo data

### Companies
- Companies may reference Places as locations or headquarters
- Company identity is separate from Place identity

### Kitchens / Venues
- Kitchens attach to Places
- Multiple kitchens may exist at one Place

Rule:
> Places are the ground. Domains build on top.

---

## 5. Google Ingestion Rules

### Search & Creation
- Google Places API is used for search and validation
- Creation happens **once**, then reused everywhere
- Google icon URLs must **never** be persisted

### Normalization
External data is:
- Normalized
- Stripped of unnecessary fields
- Stored with consistent defaults

Places may optionally be refreshed via scripts, but **never silently mutate**.

---

## 6. Media & UI Rules

### Images
- Places may have a logo or hero image
- `image_shade` is **required**
- Default value: `none`

Rule:
> Image legibility is a UI concern, not a styling hack.

### Pills vs Cards
- Pills are dumb (id + name only)
- Cards may hydrate media
- Media decisions must be consistent across domains

---

## 7. Tenant & Ecosystem Behaviour

- Places are shared across ecosystems (Misebox, Cleanbox, etc.)
- Tenants may reference the same Place without duplication
- Tenants do not fork Place data

Presentation may vary. **Truth does not.**

---

## 8. Safety & Non-Goals

Places will NOT:
- Decide ownership
- Handle claims or disputes
- Sync live business hours continuously
- Act as a social profile

Those belong elsewhere.

---

## 9. Relationship to FireUX School

Historical experiments and alternative designs live in **FireUX School**.

If complexity arises around:
- Sync strategies
- External data trust
- Ownership semantics

We may consult FireUX School, but decisions land here.

---

## 10. Final Principle

Places must remain:
- Stable
- Reusable
- Low-churn
- Dependency-safe

If Places become exciting, something has gone wrong.

#end

# AI/gpt-chats/richies.md

# Richie’s Reinigung


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-09

## Overview

Richie’s Reinigung is a real client application built for a real cleaning business. The owner is a personal contact and this app reflects actual business needs.

App identity (from `projects/cleanbox/richies-reinigung/nuxt.config.ts`):
- `id: richies-reinigung`
- `name: Richies`
- `role: tenant` (Cleanbox ecosystem)

Repo location:
- `projects/cleanbox/richies-reinigung`

## Role in FireUX

- Real-world validation
- Sales asset
- Constraint against over-engineering
- Proof FireUX works outside theory

## Key Characteristics

- Single company
- Real customers
- Real expectations
- No speculative features

## Technical Stack

- FireUX Core
- Firebase
- Nuxt 3
- Tenant app in the Cleanbox ecosystem

Configured modules (current):
- None (tenant stays lean)

## Core Features

- Branded landing page + trust surface (`app/pages/index.vue`)
- Simple contact CTAs (mailto + phone)

## Strategic Importance

- Defines what “good enough” looks like
- Helps set pricing tiers
- Anchors FireUX in reality

## Status

- Active development
- Continuous reference app
- One of the most important apps in the system

#end

