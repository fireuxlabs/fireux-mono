# FireUX - Packages Map (Codex)

Updated: 2026-02-28
Scope: high-level package map for implementation work.

Core extension packages (packages/extensions):
- fireux-products, fireux-places, fireux-jobs, fireux-kitchens, fireux-blogs, fireux-companies
- fireux-drop (supplier domain ownership)

Apps and projects (projects/*/*):
- fireux-app, fireux-tenant, cleanbox-app, richies-reinigung, misebox-app, niederhorn

Shared tooling:
- scripts/ for migrations and data fixes
- pnpm-workspace.yaml and pnpm-lock.yaml for dependency state

Notes:
- Extensions provide runtime composables, components, and pages.
- Apps consume extensions; avoid app-level forks when possible.

#end
