# FireUX Ecosystem Roadmap
Authority: Tier2 (Operational roadmap)
Updated: 2026-03-02

## Scope
- Focus this package on the FireUX ecosystem control plane, not `fireux-core`.
- Define app-level responsibilities for:
  - `fireux-app` (flagship control surface)
  - `aconsole` (operations console)
  - `fireux-tenant` (sandbox)
  - `stitch` (possible rebrand: `hive`)

## North Star
- FireUX becomes the operating system for app ecosystems:
  - one place to discover apps
  - one place to monitor status and ownership
  - one place to apply SEO and publishing standards

## Wave 1 — Ecosystem App Registry (first)
- Create a canonical app index contract in this package (source of truth for FireUX app metadata).
- Add automation so newly created apps are added to the index with minimal manual work.
- Track for each app:
  - `id`, `name`, `ecosystem`, `status`, `owner`
  - `kind` (`internal`, `public`, `tenant`, `external`)
  - `runtime` (`live`, `test`, `read-only`)
  - `seo` (`indexable`, `noindex`)
- Add CI check that fails when an app exists but is missing from the ecosystem index.

## Wave 2 — `fireux-app` as Flagship Control Plane
- Build an ecosystem dashboard for:
  - app health snapshots
  - release channel/status
  - ownership and lifecycle tracking
- Add cross-app monitoring hooks for apps inside and outside FireUX where integrations exist.
- Keep runtime selection/state behavior aligned with `docs/runtime-contract.md` (no silent fallbacks).

## Wave 3 — `aconsole` for Multi-Ecosystem Ops
- Position `aconsole` as the operations surface for:
  - FireUX ecosystem apps
  - external ecosystem apps (when connected via adapter/integration)
- Define a connector model for external ecosystems:
  - ingestion adapters
  - normalized status model
  - capability flags per connector (read-only vs managed)

## Wave 4 — `fireux-tenant` Sandbox
- Treat `fireux-tenant` as an experimentation sandbox:
  - test extension wiring
  - test theme/system variants
  - run safe workflow experiments before promotion
- Default sandbox runtime to `test`/`read-only` strategies until explicitly promoted.

## Wave 5 — `stitch` / `hive` SEO Directory
- Product direction: directory of SEO professionals.
- Build on `fireux-jobs` professional models and contracts where possible.
- Prepare for brand switch:
  - keep app/domain naming alias-ready (`stitch` -> `hive`)
  - avoid hardcoding brand strings in shared logic
- Launch requirements:
  - professional profile publish pipeline
  - search/filter directory UX
  - public route strategy aligned with runtime/SEO canon

## Wave 6 — Central SEO Operations
- Run SEO governance from the FireUX ecosystem layer:
  - canonical URL compliance checks
  - metadata coverage checks
  - sitemap readiness checks for public apps
- Keep policy aligned with `docs/seo-canon.md`.
- Ensure console/admin pages remain `noindex`.

## Open Decisions
- Should `aconsole` own external ecosystem management directly, or proxy through adapters exposed by each external app?
- Should app index automation run:
  - at scaffolding time only, or
  - continuously via CI discovery + autofix?
- If `stitch` is rebranded to `hive`, decide whether package ID changes or only public-facing brand changes.

## Immediate Next Actions
- Define app index schema in this package.
- Implement app registration automation + CI guard.
- Draft first `fireux-app` dashboard widgets against the app index.
- Confirm `stitch`/`hive` naming strategy before public launch.
