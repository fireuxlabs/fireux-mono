# Config layout

- `base/` – Nuxt-facing setup helpers (assets, components, pages, layouts, plugins, server, deploy-ignore, runtime namespace, tenant-layer helper) with no tenant-specific knowledge.
- `fireux/` – Tenant pipeline (canonical `TenantConfig`, runtime/pwa/vuefire/nitro/env/service-account helpers, firebase env priming, module utils, FireUX presets).
- `schemas/` – Shared type contracts (e.g., `firebase-project.ts`).
- `validation/` – Config validation/templates that consume the canonical contracts.

Notes:

- The only tenant contract is `fireux/tenant-config.ts`; `base/tenant-layer.ts` is just a Nuxt-layer helper for tenant modules.
- Ecosystem packages should import helpers via `config/base/...` or `config/fireux/...` paths as appropriate.
