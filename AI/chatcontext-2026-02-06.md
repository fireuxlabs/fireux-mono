# AI/codex-threads/alignment.md

# Alignment Notes — use*Interface (2026-02-06)


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Scope: `use*Interface` siblings across core + extensions, with emphasis on `useProductInterface`. This thread is about products; other notes are to align expectations and flag unwanted fallbacks.

## Canon (baseline expectations)
- Interfaces should be **deterministic** and **non-magical**: no “smart” fallback chains that hide missing data.
- Prefer **single-source fields** (explicit map from model fields) over “best-guess” fallbacks.
- `card()` should be the canonical minimal view model; `pill/cell/preview/profile` should not add hidden fallbacks unless explicitly required by UX.
- **Products must follow the canon**: keep `useProductInterface` minimal (name/description/image), avoid cascading fallbacks.

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

## Fallbacks to Flag (we don’t want these by default)
### Places
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ''`
- Preview defaults:
  - `source: target.source ?? 'fireux'`
  - `prop: brand_tagline || short_name || ''`

### Companies
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ''`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? 'fireux'`

### Kitchens
- Pill title/subtitle fallback chain:
  - `title: base.title || base.name`
  - `subtitle: base.subtitle || base.shortAddress || base.formattedAddress || ''`
- Cell/Preview/Profile `prop` fallbacks:
  - `brand_tagline || website || shortName`
- Preview default:
  - `source: target.source ?? 'fireux'`

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

## Product Canon (keep it clean)
- `useProductInterface` should stay **lean**:
  - `title = name`, `subtitle = description`
  - `avatarUrl = main_image || images[0]`
  - no fallback chains for title/subtitle beyond direct model values
- If UX needs “nice” fallback behavior, put it **in the component** (not in the interface).

## Ecosystem vs App (locked)
Products (and blogs) are ecosystem defaults, resolved at app initialization, and configurable per app.

Internal rule:
- Core enables.
- Ecosystems decide.
- Apps configure.

## Alignment To-Do (when we choose to act)
- Remove or minimize fallback chains in `pill/cell/preview/profile` for Places/Companies/Kitchens.
- Avoid defaulting `source` to `'fireux'` unless explicitly required by UI.
- Decide if Jobs subtitle should fall back to `workplace_label` or stay empty (current is empty).
- Keep Product interface minimal and explicit.

## Drift Rules
- Drift managers should behave consistently across entities.
- Dev drift should flag only props that fall outside the canonical shape.

## Watchlist
- Product interface + product create/validation paths change frequently; keep `useProductInterface` lean and deterministic.
- Entity collection managers changed recently; re-validate no new fallback chains were added.


---

# AI/codex-threads/design-system.md

# FireUX Design System — Codex Thread


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Draft**
Version: **v2**
Updated: 2026-02-05
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


---

# AI/codex-threads/extensions.md

# FireUX — Extensions Scan (Codex Thread)


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-05

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


---

# AI/codex-threads/products.md

# FireUX — Products & Revenue (Codex Thread)


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-05

This file is a Codex-owned working thread for “what we can sell” decisions.
It should stay practical and sale-driven (no platform-theory).

Primary context docs:
- `AI/gpt-chats/fireux-app.md` (FireUX main company app)
- `AI/gpt-chats/fireux-fireux.md` (FireUX ecosystem)
- `AI/gpt-chats/misebox-app.md` (strategic product, slower)
- `AI/gpt-chats/cleanbox-app.md` (Cleanbox main app)
- `AI/gpt-chats/richies.md` (real client anchor)

Automation:
- This file lives under `AI/` and will be picked up by the daily 3 AM scan/versioning.

---

## 1. Current Reality

- Cash constraint is the driver: we need revenue soon.
- We sell **working apps**, not FireUX as an abstract platform.
- FireUX exists to let us ship/sell repeatable apps without burning out.

---

## 2. Sanity Check (From Today’s Brainstorm)

These are the key “keep forever” statements:

- Sell working apps, not promises.
- Ecosystems beat custom work (a known starting point + known cost).
- White-label is leverage later, not a day-one requirement.
- FireUX stays lean; it sells indirectly by making apps feel real/legit.

### 2.1 What FireUX Can Sell (Simple Menu)

1. **Branded Business Apps (Primary Product)**

A ready-made app/website for a business.
- Based on an existing ecosystem (Cleanbox, Misebox)
- Branded for one company
- Hosted, maintained, updated
- Sold as:
  - One-time setup fee
  - Monthly subscription

This is the core, easiest sell.

2. **Ecosystem Memberships**

Access to a shared industry network.

Examples:
- Cleaning companies on Cleanbox
- Hospitality professionals or kitchens on Misebox

Includes:
- Public profile/listing
- Visibility in search
- Jobs (post or apply)

Sold as:
- Low monthly fee
- No dedicated app required

3. **Dedicated Apps Inside an Ecosystem**

A step up from membership.
- Same ecosystem benefits
- Plus a private branded app
- Faster, cheaper than custom development
- Shares SEO and infrastructure

Sold as:
- Higher setup fee
- Higher monthly subscription

4. **White-Label Apps**

Same app, different brand.
- Re-skinned versions of proven apps
- Hosted by you
- “Powered by FireUX” (optional)

Sold as:
- Monthly license
- Optional setup fee

Lower volume, higher leverage.

5. **Custom Client Apps**

Bespoke work, but on FireUX.
- Framed as “built on the FireUX platform”
- Uses existing systems and rules
- Not pure freelancing

Sold as:
- Project fee
- Optional ongoing subscription

Low volume, high trust.

6. **Paid Add-Ons**

Extras inside existing apps.

Examples:
- Extra team members
- Extra profiles
- Bookings
- Payments
- Advanced analytics
- Push notifications

Sold as:
- Monthly upgrades

7. **Setup & Onboarding Services**

One-time services.

Examples:
- App setup
- Branding
- Data import
- Domain & PWA setup

Sold as:
- Fixed one-off fees

8. **Support & Maintenance Plans**

Peace of mind.
- Priority support
- Small changes included
- Ongoing updates

Sold as:
- Monthly add-on

9. **Digital Products (Later)**

Developer-facing.

Examples:
- Boilerplates
- UI kits
- Firebase schemas
- Documentation

Sold as:
- One-time purchase

Focus (cash-first):
- Sell **#1** now (Cleanbox tenants), bundling **#7/#8** into setup + subscription.
- Treat **#2–#6** and **#9** as menu items we only activate after cloning + pricing is stable.

---

## 3. Where `fireux-app` Fits (Important)

`fireux-app` is not the thing customers buy directly.

Role:
- First-party brand surface (“Built on FireUX”).
- Host neutral modules (currently: `fireux-products`, `fireux-blogs`).
- Provide legitimacy for ecosystem apps and client apps.

Constraints (keep it boring on purpose):
- No pricing page (yet) unless a real sale forces it.
- No customer onboarding flows unless a real sale forces it.
- No customer consoles unless demanded by real usage.
- No “platform” features unless forced by real sales.

Repo truth:
- `projects/fireux/fireux-app/nuxt.config.ts` defines `id: fireux-app`, role `global`, modules `fireux-products` + `fireux-blogs`.

### 3.1 FireUX tenant sandbox (future)

Repo:
- `projects/fireux/tenant`

Purpose:
- Safe sandbox to test modules + tenant wiring without polluting real ecosystems

Companion context file:
- `AI/gpt-chats/fireux-tenant.md`

### 3.2 Ecosystem baseline (Canon)

Locked decisions:
- Core modules are internal-only plumbing (never marketed): `fireux-core`, `fireux-ecosystem-controller`, `fireux-nuxtfire`.
- Ecosystems are mandatory: every app resolves `fireux-${ecosystem}` (no ecosystem-less mode).
- `fireux-fireux` is the neutral default ecosystem. Baseline modules:
  - `fireux-products`
  - `fireux-blogs`
- Not standard in `fireux-fireux` (opt-in per ecosystem/app):
  - `fireux-places` (physical-world bias; not required for purely digital products)
  - `fireux-companies` (opinionated; promote to baseline only when mature)
  - Domain-heavy extensions (`fireux-jobs`, `fireux-kitchens`, `fireux-drop`, etc.)

Repo reality:
- Ecosystem defaults set `fireux.products` + `fireux.blogs` in runtime config (fireux-fireux/cleanbox/misebox).
- Product defaults + module wiring are active change areas; keep the sellable scope aligned with what’s live.
- Apps can still override via `modules: [[ 'fireux-products', { ... } ], 'fireux-blogs']` in `nuxt.config.ts`.

---

## 4. Ruthless Focus Cut (Next 3–6 Months)

### 4.1 One Paying App (Anchor)

Primary anchor:
- Richie’s (`projects/cleanbox/richies-reinigung`)

Rule:
- Any feature Richie doesn’t need is suspicious.

### 4.2 One Ecosystem To Push (Revenue Bias)

Near-term push:
- Cleanbox (fewer roles, fewer legal edges, clearer buyer: business owner)

Long-term strategic:
- Misebox (bigger vision, heavier operational/legal surface area)

Working split:
- Cleanbox pays sooner.
- Misebox matures slower.

### 4.3 Pricing Model (For Now)

Keep it simple:
- One setup fee.
- One monthly subscription.
- No add-ons, no tiers, no options menu (yet).

---

## 5. Product Ladder (Easiest → Hardest)

Order of attack:

1. A real client app (Richie’s) with a boring, stable value proposition.
2. A reusable ecosystem app (Cleanbox) that can be cloned into tenants fast.
3. White-label packaging of proven apps (only after (1) + (2) feel repeatable).
4. Marketplace complexity (Misebox jobs/applications, etc.) only when usage forces it.

Also intentionally defer:
- Add-ons / support plans / digital products (pricing + support overhead)

---

## 6. What “Cloneable” Means (Technical Definition)

Goal:
- “Richie’s → new tenant” in under an hour without special-case logic.

Minimum bar:
- Tenant app can ship with lean modules and branded landing.
- Global app carries the heavier modules.
- Config-driven identity: `ecosystem`, `id`, `role`, and `modules` live in `nuxt.config.ts`.

Repo facts observed today:
- `projects/cleanbox/cleanbox-app` is landing-first today (see `projects/cleanbox/cleanbox-app/app/pages/index.vue` + `projects/cleanbox/cleanbox-app/docs/gap.md`).
- `projects/cleanbox/richies-reinigung` is tenant + lean modules today (see `projects/cleanbox/richies-reinigung/nuxt.config.ts`).

---

## 7. Language / Legal Safety (Sales Copy Constraint)

We need to keep wording legally safe, but also not self-sabotage conversion.

Watch-outs:
- “Hire Richie” exists in Richie’s landing today (`projects/cleanbox/richies-reinigung/app/pages/index.vue`).
- Decide whether that wording is acceptable for a single-company service app.

---

## 8. Next Concrete Steps

1. Define “first paying offer” for Richie’s:
   - Setup fee amount
   - Monthly amount
   - What is included (bullet list)
   - Subscription boundary: what counts as “small improvements” per month (hard limits)
2. Make Cleanbox tenant cloning boring:
   - Tenant template checklist
   - Branding inputs required (logo/wordmark/cover, colors, contact CTAs)
3. Reduce promise surface:
   - Ensure landing CTAs don’t route to non-existent pages (or add placeholders).
4. Decide FireUX-app’s minimal sales role:
   - What it must contain to support credibility (and nothing else).

---

## 9. Open Questions (Answer When Ready)

- What is Richie’s actual paid “unit”?
  - Just a marketing site + contact funnel, or operational tooling soon?
- Who is the first 10 Cleanbox buyers (profile)?
- What’s the minimum scope that can be delivered repeatedly without support hell?

This is a solid, coherent v1. You’re not missing anything fundamental, and—importantly—you’ve already cut away most of the things that usually bloat this kind of doc.

What you asked for explicitly at the end is:

“From number 20 plus”
I’m going to interpret that as: extend this debrief with the remaining conclusions, clarifications, and locked decisions that emerged, without rewriting what already works.

Below is a clean continuation that fits your tone, scope, and Codex intent.

⸻

10. Channel Pricing (Locked)

We now explicitly support channel-based pricing for the same underlying tenant app.

Channels
	1.	FireUX-routed (Assisted Placement)
	•	Client contacts FireUX directly
	•	FireUX qualifies + routes to an ecosystem
	•	FireUX acts as operator/broker
Outcome:
	•	Lower “operator rate”
	•	Not publicly advertised
	•	Used to seed ecosystems and close deals quickly
	2.	Ecosystem-direct (Retail)
	•	Client lands on Cleanbox / Misebox directly
	•	Self-identifies with the industry brand
	•	Buys into the ecosystem promise
Outcome:
	•	Higher public price
	•	Brand-led value (belonging, network, identity)
	•	Price can increase over time as ecosystem matures

Rule (Canon):

Same app, different channel, different price — as long as they are never shown side by side.

⸻

11. Early Pricing Posture (Time-Based, Not Absolute)

We are not setting “forever prices”.

Instead:
	•	Prices reflect current ecosystem value
	•	Early adopters are grandfathered
	•	New tenants pay the current public rate

Misebox example (illustrative, not final):
	•	Launch phase: CHF 25 / month
	•	Growth phase: CHF 35 / month
	•	Mature phase: CHF 50 / month

FireUX-routed placements can remain at operator rate even as public pricing increases.

⸻

12. Ecosystem User vs Tenant (Important Structural Split)

Ecosystems are not just “apps for businesses”.

Each ecosystem has two participation layers:

1. Ecosystem Users (Non-App)
	•	Individuals / professionals
	•	No dedicated app
	•	Participate via profiles, search, jobs, visibility

Purpose:
	•	Seed demand
	•	Create network value
	•	Increase tenant ROI

Pricing:
	•	Free (initially)
	•	Optional low-cost tier later if commitment is needed

2. Ecosystem Tenants (Businesses)
	•	Kitchens, cleaning companies, etc.
	•	Pay to access users + visibility
	•	May or may not have a dedicated app

This separation is non-negotiable for long-term value.

⸻

13. Product Routing (Canon, Final)

All sales conversations resolve to one of these outcomes:
	1.	FireUX App
Generic, neutral, hosted app.
	2.	Industry App (Tenant)
Business routed into an existing ecosystem (Cleanbox, Misebox).
	3.	White-Label App
Single client, rebranded, hosted.
	4.	Ecosystem White-Label
Operator runs a branded ecosystem (existing or new).
	5.	Template + Modules
Developer, self-hosted, no SaaS.

Everything else (setup, support, add-ons) is secondary and only activated when needed.

⸻

14. Ecosystem Bias (Intentional)

We explicitly prefer:
	•	Existing ecosystems
	•	Known domains
	•	Shared infrastructure

Reasons:
	•	Faster delivery
	•	Lower support cost
	•	Shared marketing upside
	•	Revenue share alignment

New ecosystems are supported, but:
	•	More expensive
	•	Slower to launch
	•	Treated as exceptions, not defaults

⸻

15. FireUX Core Positioning (Internal Only)

FireUX is not sold as a platform today.

Externally:
	•	FireUX = “Built with FireUX”
	•	Credibility + consistency signal

Internally:
	•	FireUX = leverage engine
	•	Prevents burnout
	•	Makes cloning boring

Any feature not required to:
	•	close sales
	•	support tenants
	•	maintain credibility

…is deferred.

⸻

16. Clone Speed Is the North Star

Every product decision is evaluated against:

“Can we ship a new tenant in under 1 hour?”

If not:
	•	Feature is suspect
	•	Scope is too wide
	•	Or belongs in ecosystem/global app, not tenant

⸻

17. Language Discipline (Sales Safety)

We avoid:
	•	“Platform”
	•	“Ecosystem-first framework”
	•	“Modular architecture”

We prefer:
	•	“Professional app”
	•	“Hosted and maintained”
	•	“Built for your industry”
	•	“We handle the technical side”

Legal + clarity beats cleverness.

⸻

18. What We Are Not Doing (Explicit Non-Goals)

For the next phase, we are not:
	•	Building complex pricing tiers
	•	Selling add-ons aggressively
	•	Opening marketplaces prematurely
	•	Supporting arbitrary custom workflows
	•	Chasing “power users” at the cost of simplicity

⸻

19. Success Metric (Very Simple)

Short-term success is not:
	•	GitHub stars
	•	Feature count
	•	Perfect abstractions

It is:
	•	Paying tenants
	•	Low support load
	•	Repeatable onboarding
	•	Calm development pace

⸻

20. Final Canon Summary (One Page)
	•	FireUX sells apps, not a platform.
	•	Ecosystems are the default delivery vehicle.
	•	Cleanbox pays sooner; Misebox compounds later.
	•	Channel pricing is intentional and allowed.
	•	Users create value; tenants pay for access.
	•	Clone speed beats flexibility.
	•	If Richie doesn’t need it, we don’t build it.

⸻

If you want, next logical Codex threads would be:
	•	“First Paid Offer: Richie’s (Exact Scope + Price)”
	•	“Cleanbox Tenant Onboarding Checklist (1-hour rule)”
	•	“Pricing & Grandfathering Policy (Internal)”

But as a products & revenue debrief, this is coherent, defensible, and executable.


---

# AI/gpt-chats/cleanbox-app.md

# cleanbox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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


---

# AI/gpt-chats/fireux-app.md

# fireux-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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

## Current Scope

- Lean, first-party FireUX app shell
- Used for FireUX-branded surfaces and module-driven pages


---

# AI/gpt-chats/fireux-cleanbox.md

# FireUX – Cleanbox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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


---

# AI/gpt-chats/fireux-fireux.md

# FireUX – FireUX Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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


---

# AI/gpt-chats/fireux-misebox.md

# FireUX – Misebox Ecosystem


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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


---

# AI/gpt-chats/fireux-tenant.md

# fireux-tenant


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Planned**
Version: **v1**
Updated: 2026-02-05

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


---

# AI/gpt-chats/fireux.md

# FireUX Project — AI Working Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v2**
Updated: 2026-02-05
Previous: v1 (2026-02-04)

This file defines how ChatGPT should behave inside the **FireUX Project**.

FireUX is a mature, opinionated system.
This project space is for **execution, alignment, and shipping**.

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


---

# AI/gpt-chats/jobs.md

# FireUX Jobs — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Stable**
Version: **v2**
Updated: 2026-02-05
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


---

# AI/gpt-chats/misebox-app.md

# misebox-app


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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


---

# AI/gpt-chats/places.md

# FireUX Places — Canonical Package Contract


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Stable**
Version: **v2**
Updated: 2026-02-05
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


---

# AI/gpt-chats/richies.md

# Richie’s Reinigung


Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Updated: 2026-02-05

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
