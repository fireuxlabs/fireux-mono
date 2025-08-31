# Nuxt Config Consolidation — Results

## Summary

- All apps now import shared config via package exports:
  `fireux-core/config/app/base-nuxt.config`
- Standardized ecosystems: fireux, misebox, cleanbox
- Ports set: fireux 3000, misebox-app 3001, niederhorn 3003, cleanbox-app 3002, richies-reinigung 3004
- `fireux-core/package.json` exports updated to expose config helpers

## Files changed

- packages/core/fireux-core/package.json (exports)
- projects/fireux/fireux-app/nuxt.config.ts
- projects/misebox/misebox-app/nuxt.config.ts
- projects/misebox/niederhorn/nuxt.config.ts
- projects/cleanbox/cleanbox-app/nuxt.config.ts
- projects/cleanbox/richies-reinigung/nuxt.config.ts

## Follow-up (optional)

- If app scripts already pass `--port`, that wins over `server.port`.
- Consider adding a TS path alias only if desired; package exports are sufficient.
