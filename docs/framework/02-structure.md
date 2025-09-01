# Repository Structure

- docs/: human docs and ADRs; framework chapters live here
- packages/: Nuxt modules by domain
  - core/fireux-core: framework only (no domain code)
  - extensions/: jobs, places (domain modules)
  - tenants/: cleanbox, misebox (domain modules)
- projects/: deployable Nuxt apps composing packages
- tools/: editor tooling (VS Code toolbar)
- scripts/: maintenance and utilities
- archive/: historical reports moved from root
- reports/: transient reports (will be archived regularly)

Rules:
- Keep domain code out of fireux-core.
- Use workspace:* for inter-package deps.
- Put docs next to code when they’re package-specific.