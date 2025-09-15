# Synchrony vs Async in FireUX composables

Effective: 2025-09-15

Scope: useApp, useCoreUser, useAppUser and the composables they call

Summary

- InjectTrace server logs showed Vue’s warning: "inject() can only be used inside setup() or functional components." The stacks consistently pointed to composables declared `async` and/or using `await` before or around Vue/Nuxt/VueFire composables (useFirestore, useDocument, useCurrentUser, useRuntimeConfig, etc.).
- Root cause: Declaring a composable `async` returns a Promise and often leads to `await` within it. Any continuation after an `await` is no longer running within the original component’s setup callstack, so Vue’s dependency injection (provide/inject) context can be missing when calling VueFire/Nuxt composables.
- Decision: Keep top-level composables synchronous and return refs/computeds immediately. Perform async work via returned helper methods or by returning reactive refs whose sources stream asynchronously.

Why synchronous composables?

- Vue/Nuxt/VueFire composables rely on an active setup/nuxtApp context. Calling them after an `await` risks the inject context not being active.
- Returning refs synchronously matches Vue’s reactivity model: data flows in later; consumers react.
- SSR hydration stability: fewer timing edges, cleaner server/client parity.

Findings per composable

1. useCoreUser (current state in repo may be async)

- Issues seen: async + await firestoreFetchCollection while also using useFirestore/useDocument/useCurrentUser.
- Recommendation: Make it sync.
  - Return: { coreUser: Ref<CoreUser|null|undefined>, coreUsers: Ref<CoreUser[]|undefined>, …helpers }
  - Implementation: call useFirestore/useCurrentUser/useDocument synchronously; use manager’s read helpers that return Refs (no await).

2. useAppUser

- Issues seen: call sites used `await useAppUser()` which forced execution past setup boundaries. The composable itself can remain sync.
- Recommendation: Keep it sync; ensure all VueFire calls happen without awaits; expose computed/refs.
- Consumers: Stop awaiting; destructure directly: `const { appUser, isAppUser } = useAppUser()`.

3. useApp

- Current: declared async; awaits collection and dynamic import for client-only onboarding helpers.
- Recommendation:
  - Core composable should be sync for inject safety.
  - Pattern for client-only extras:
    - Do not await inside the composable. Either:
      a) Expose a method `loadClientExtras()` that does `if (import.meta.client) { const { useAppOnboarding } = await import('./useAppOnboarding'); return useAppOnboarding(); }`
      b) Or lazily import in component onMounted if needed.
  - Collections: prefer manager’s read helper returning a Ref. No await.

Child composables touched

- useFirestoreRead: provide sync wrappers returning Refs (done: firestoreFetchCollection/doc return Refs)
- useFirestoreManager: call useFirestoreRead per-invocation; remain sync
- Profile/Create/Delete: Defer useRuntimeConfig/useFirestore etc. until the actual function call (not at composable definition time), or ensure they run inside setup without awaits before them.

Contract (target shape)

- Inputs: none (read composition, infer appId/currentUser internally)
- Outputs: Plain object of refs/computeds and functions; no Promise.
- Error modes: throw early for missing Firebase app (getApps().length === 0) to avoid undefined injects.
- Success criteria: No InjectTrace logs for inject/nuxt-composable misuse; all call sites can simply `const x = useX()`.

Migration blueprint

- Step 1: Refactor top-level composables to be sync:
  - useCoreUser: remove `async`; remove `await` around reads.
  - useAppUser: ensure no internal awaits; ensure SSR guards for useCurrentUser.
  - useApp: split client-only dynamic imports into an explicit `loadClientExtras()` or return a shallowRef and hydrate later.
- Step 2: Update call sites to drop `await`.
- Step 3: Re-run dev with InjectTrace. Fix remaining stacks by pushing any remaining Nuxt/VueFire calls before any `await`, or move awaits into helper methods triggered after setup.

Edge cases to watch

- SSR: Guard any browser-only APIs with `import.meta.client` or `process.client`.
- Current user: `useCurrentUser` is client-side; use a `ref(null)` on server to avoid injects that require Firebase Auth.
- Dynamic imports: Avoid awaiting inside composables returned value; expose a method to trigger it later.

Recommendations (short)

- Do: keep useApp, useCoreUser, useAppUser synchronous.
- Do: return Refs/Computed and functions; let async work occur inside those functions or via VueFire streams.
- Don’t: declare composables async or await inside them before calling inject-dependent composables.
- Instrumentation: keep /api/inject-trace enabled during refactor; disable for production.

Next steps

- Convert useCoreUser and useApp to sync; ensure useAppUser remains sync; remove await in all call sites.
- Re-run dev; verify no InjectTrace logs. If any remain, fix per stack frame.
