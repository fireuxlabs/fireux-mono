# Apps Changelog
Authority: Tier2 (Operational history)
Updated: 2026-03-28

Tracks meaningful changes in app-level delivery, app surface ownership, and app-facing flow changes.

## 2026-03-28 - App console visibility moved to app config

Previous:
- app console hubs could show families because shared routes existed, even when that app should not expose them

Now:
- apps declare visible console families through `consoles` in `nuxt.config.ts`
- examples:
  - FireUX app -> `projects`
  - Misebox app -> `kitchen`, `supplier`
  - Granite app -> `portfolio`
  - apps like `fireux-tenant` and `cleanbox-app` can declare no visible console families

Why:
- make console exposure intentional per app
- stop shared route registration from acting like app policy
- keep tenant and global apps honest about what they actually manage

Affected:
- app `nuxt.config.ts` files
- shared console entry CTA behavior

## 2026-03-11 - Project console create flow aligned

Previous:
- project console creation and overview flow had more route-specific divergence.

Now:
- project console create flow is more consistent with the broader console entry model.

Why:
- make app-level console behavior easier to reason about
- reduce app-local branching around create and overview flows

Affected:
- `projects/fireux/fireux-app/**`
- project console pages
- project create form and system components

## 2026-03-10 - Project runtime entry and CTA family aligned

Previous:
- project entry points and CTA behavior were less unified across public and console surfaces.

Now:
- project CTA and runtime entry behavior are aligned around one clearer family.

Why:
- give apps a more predictable entry pattern
- reduce duplication between public create and console create expectations

Affected:
- FireUX app project pages
- project CTA components
- runtime project entry composables
