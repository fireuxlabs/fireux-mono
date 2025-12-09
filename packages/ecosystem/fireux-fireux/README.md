# FireUX Ecosystem (`fireux-fireux`)

Owned by fireux.

Base FireUX ecosystem bundle consumed by both `fireux-app` and `tennant` apps. Ships shared branding, navigation defaults, registry metadata, and wiring for FireUX modules.

## Quick start

1. Enable in your Nuxt app:
   ```ts
   export default defineNuxtConfig({
     modules: ['fireux-fireux'],
   })
   ```
2. Keep the registry entry up to date before committing (`registry.json`).
3. Register the package when publishing:
   ```bash
   pnpm registry:register packages/ecosystem/fireux-fireux/registry.json
   ```
4. Read the package docs:
   - `packages/ecosystem/fireux-fireux/docs/mission.md`
   - `packages/ecosystem/fireux-fireux/docs/roadmap.md`
