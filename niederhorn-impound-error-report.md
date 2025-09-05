# Niederhorn Nitro impound error report

Date: 2025-09-05
App: projects/misebox/niederhorn (Nuxt 4.0.3, Nitro 2.12.4)

## Symptom

Dev server fails with:

```
RollupError: [plugin impound] Vue app aliases are not allowed in server runtime.
[importing #build/nuxt.config.mjs from .../node_modules/nuxt/dist/app/nuxt.js]
```

## Diagnosis summary

- Cause: Server runtime (Nitro) imported an app-only alias via a chain that reached `#build/nuxt.config.mjs`.
- Trigger: A server API handler imported `#imports` to call `useRuntimeConfig()`. `#imports` is a Vue app alias disallowed in Nitro server bundle.
- Offending file: `packages/core/fireux-core/src/runtime/server/api/health.get.ts`
  - Before: `import { useRuntimeConfig } from '#imports'`
  - After: use Nitro-provided `useRuntimeConfig()` without importing from app aliases.

Other shared runtime files were checked. Client/SSR composables and a client-only plugin had temporary `#imports` changes; we reverted to `nuxt/app` there to retain proper types since they are not used in server-only code paths.

## Detailed findings (grep)

- Server code importing app aliases:
  - `packages/core/fireux-core/src/runtime/server/api/health.get.ts` → `#imports` (fixed)
- Project `.nuxt/**` contains generated references to `#app`/`#build` which are expected.
- No other `packages/**/src/runtime/server/**` files import from `nuxt/app`/`#app`/`#imports`/`#build`.

## Fix applied

- Replace `#imports` import in server API with runtime-available `useRuntimeConfig()`:
  - Avoids `#app`/`#imports` in server bundle, satisfying impound.
- Keep client/SSR code using `nuxt/app` (auth.vue, composables, client plugin) or `#imports` auto-import at build time only in app context.
- Converted error template generator to avoid `import type { NuxtError } from '#app'` by using a structural type in the generated `error.vue`.

## Reproduction steps

1. Clean cache and run dev:
   - Remove `.nuxt` in `projects/misebox/niederhorn` (optional): `rm -rf projects/misebox/niederhorn/.nuxt`
   - Start: `pnpm dev:niederhorn`
2. Expected: Server starts without impound error on port 3003.

## Recommendations

- Guideline: In server runtime code (`packages/**/src/runtime/server/**`, `server/**`, API handlers, and server plugins), do not import from:
  - `#app`, `nuxt/app`, `#imports`, or `#build/*`.
- Use Nitro-safe APIs:
  - `useRuntimeConfig()` (no import needed), `getQuery`, `readBody`, etc., from `h3` or `nitropack`.
- Split utilities:
  - Keep Vue composables in `runtime/composables/**` (client/SSR).
  - Use `runtime/server/utils/**` for server-only helpers with no Vue dependencies.

## Status

- Offending import fixed.
- If error persists, share the full stack (with `DEBUG=nitro:*`) to trace any remaining path pulling `#build/nuxt.config.mjs` in server context.
