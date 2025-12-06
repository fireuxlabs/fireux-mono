# Drop

Owned by fireux.

Describe what this module ships, its guardrails, and how consumers should enable it.

## Quick start

1. Enable in your Nuxt app:
   ```ts
   export default defineNuxtConfig({
     modules: ['fireux-drop'],
   })
   ```
2. Update `registry.json` before committing (name, team, runtime notes).
3. Publish to FireUX registry:
   ```bash
   pnpm registry:register packages/extensions/fireux-drop/registry.json
   ```
