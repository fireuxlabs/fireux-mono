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
- Tie-ins: Orders route to stations; kitchen updates ETA; inventory decrements per recipe; ops dashboard monitors throughput.

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
