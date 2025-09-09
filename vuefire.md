# VueFire auth initialization report

Error seen: `[VueFire] useCurrentUser() called before the VueFireAuth module was added to the VueFire plugin. This will fail in production.`

What it means
- `useCurrentUser()` requires the VueFire Auth module to be enabled on the client before any call is made in setup().
- In Nuxt, this is done by the `nuxt-vuefire` module with `vuefire.auth.enabled = true`.

Current configuration
- Central Nuxt config factory: `packages/core/fireux-core/src/runtime/utils/fireux-config.ts`
  - Modules include: `['nuxt-vuefire', vuefireMerged]` (always on)
  - Defaults: `auth: { enabled: true, sessionCookie: false }` ✓
  - Firebase config is read from env and exposed to runtimeConfig.public.firebaseConfig ✓
- Therefore, auth should be enabled in all apps using `createFireuxConfig()`.

Where `useCurrentUser()` is used (sampling)
- `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Create/System.vue`
- `packages/tenants/fireux-misebox/src/runtime/composables/firestore/objects/Recipe/useRecipeCreate.ts`
- `packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts`
- `packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/*/use*Create.ts`
- Many more across tenant/runtime composables and components.

Why you still see the warning in dev
- The warning appears if a component/composable calls `useCurrentUser()` before VueFire’s plugin has mounted on the client.
- This can happen when: 
  1) A page or plugin executes a composable importing `useCurrentUser()` directly at import-time (top-level), not inside a function; or
  2) A server-only context tries to access it (SSR) before client hydration; or
  3) The `nuxt-vuefire` module is not loaded in that app (misconfigured modules).

Findings in this repo
- `nuxt-vuefire` is included by default via the shared config (see above). So (3) is unlikely unless an app overrides modules.
- Several composables correctly call `useCurrentUser()` within a function (`useRecipeCreate`, etc.), which is good.
- The most common culprit is an eager import (top-level) or running a composable in a Nitro/server context.

Actionable checks
1) Ensure no top-level calls: scan for `useCurrentUser()` used at module top-level (outside of `setup()`, a composable, or a function). It should only be called inside `setup()`/`<script setup>` or inside a composable function body.
2) Guard SSR: if a composable can run on server, avoid calling `useCurrentUser()` until `process.client` is true, or wrap in `if (import.meta.client) { ... }`.
3) Verify app modules: each app’s `nuxt.config.ts` uses `createFireuxConfig` with default modules. Confirm no app removed `nuxt-vuefire`.
4) Plugin order: avoid custom plugins that import VueFire composables at top-level; register them as client: true if needed.

Recommended fixes (minimal)
- Move any top-level `useCurrentUser()` into a function or `onMounted`/`watchEffect` within `setup()`.
- For shared runtime composables that may run during SSR, use:
  
  ```ts
  export function useMaybeCurrentUser() {
    return import.meta.client ? useCurrentUser() : ref(null)
  }
  ```
  
  And call this in SSR-safe code paths only.

Validation plan
- Reproduce the warning on the specific route/component, identify the import chain that triggers an early call, and relocate the call inside client-only execution.

Appendix: key files
- Config: `packages/core/fireux-core/src/runtime/utils/fireux-config.ts`
- Example usage: `packages/tenants/fireux-misebox/src/runtime/composables/firestore/objects/Recipe/useRecipeCreate.ts`
- App configs: `projects/*/*/nuxt.config.ts`
