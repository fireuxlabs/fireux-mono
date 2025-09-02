# Composables report — how core exposes composables to apps

This note explains how composables from `fireux-core` are provided and auto‑imported in consuming apps, with a quick inventory and usage tips.

## How composables are registered

- In `src/module.ts`, the core module calls `configureComposables(resolver)`.
- `configureComposables` (see `src/config/composables-config.ts`) registers folders for Nuxt auto‑imports:
  - `src/runtime/composables` and all nested subfolders
  - `src/runtime/utils` and all nested subfolders
- Nuxt scans these directories and auto‑imports any exported functions using the file/basename as the symbol name (e.g., `useApp`, `useAuth`, `useFirestoreRead`). No manual import statements are required in Vue components or composables.

Code pointer:

- `src/config/composables-config.ts`
  - Uses `addImportsDir([...])` with:
    - `./runtime/composables`
    - `./runtime/composables/**`
    - `./runtime/utils`
    - `./runtime/utils/**`

## How apps consume them

- In a consuming app that enables the `fireux-core` module, you can call composables directly:
  - `const { app, appId } = useApp()`
  - `const currentUser = useAuth()`
  - `const { getDoc, setDoc } = useFirestoreManager()`
  - `const { products } = useProducts()`
- TypeScript: value exports are auto‑imported; types should be imported explicitly from their file paths if needed (e.g., `import type { Product } from 'fireux-core/.../product.model'`).

## Categories and common composables (not exhaustive)

- App:
  - `useApp`, `useAppComputed`, `useAppUpdate`, `useEnsureApp`, `useAppOnboarding`, `useAppSubscriptionSetup`
  - Routes/utilities: `useCoreRoutes`, `useAdminRoutes`, `useAppUserRoutes`, `useSystemRoutes`, `useBreadcrumbs`, `useAppValidation`, `useAppFormatting`, `useEditHandler`, `useAvatarProxy`
- Firebase:
  - `useAuth` (via nuxt-vuefire Auth), `useFirebaseStorage`, `useMediaStorage`
- Firestore (generic):
  - `useFirestoreManager`, `useFirestoreCreate`, `useFirestoreRead`, `useFirestoreUpdate`, `useFirestoreDelete`, `useFirestoreUtils`
- Firestore (domain models):
  - CoreUser: `useCoreUser`, `useCoreUserComputed`, `useCoreUserEnsure`, `useCoreUserUpdate`, `useCoreUserDelete`
  - AppUser: `useAppUser`, `useAppUserComputed`, `useAppUserEnsure`, `useAppUserUpdate`, `useAppUserDelete`, `useAppUserSubscription`, utils (formatting/validation)
  - Profiles: `useProfile`, `useProfileCreate`, `useProfileUpdate`, `useProfileDelete`
  - Objects/Product: `useProducts`, `useProductCreate`, `useProductUpdate`, `useProductDelete`, `useProductUtils`, creation state, formatting/validation
  - Objects/Blog: `useBlogs`, `useBlogPosts`, `useBlogCreate`, `useBlogUpdate`, `useBlogDelete`, utils, creation state
  - Generic Objects: `useObject`, `useObjectCreate`, `useObjectUpdate`, `useObjectDelete`, `useSimpleObjectCreate`
- Effects:
  - `useLandingEffect`
- Admin:
  - `useAdminManager`, `useAdminSettings`, `useAdminMetrics`, `useProductMetrics`, `useBlogMetrics`, `useUserMetrics`
- Config helper:
  - `FireUXConfig` composable (runtime config accessors/utilities)

Note: The above lists are indicative and based on current folders under `src/runtime/composables/**`.

## Naming and colocation conventions

- Composables follow the `useXxx` naming pattern and live close to their domain (e.g., `firestore/objects/Product/useProductCreate.ts`).
- Prefer small, focused composables that return `{ state, computed, actions }` as appropriate for clear composition.

## Override and collision rules

- Nuxt auto‑imports will warn on duplicate symbols. If an app defines a composable with the same export name, the resolution order determines which wins; prefer unique names or explicitly import/alias in the app when shadowing.
- Recommendation: If apps need to customize behavior, create an app‑level wrapper composable (e.g., `useAppProductCreate`) instead of redefining a core symbol, or re‑export under a different name.

## SSR and lifecycle guidance

- Many composables touch Firebase/VueFire; they should be used in components/composables that run in the client or in SSR‑safe ways.
- If a composable requires browser APIs (or authenticated user), gate usage:
  - `if (process.client) { const x = useAuth(); ... }`
  - or defer to `onMounted` when appropriate.
- Auth is managed by `nuxt-vuefire`; core avoids double‑initialization. `useAuth` should not be invoked before VueFire registers on the client.

## Troubleshooting

- Symbol not found at runtime/build:
  - Ensure the app has the `fireux-core` module enabled and the file lives under `src/runtime/composables/**` or `src/runtime/utils/**`.
  - Restart dev server after adding new composables to refresh auto‑import declarations.
- Duplicate symbol warnings:
  - Rename the app‑level composable or use explicit imports to disambiguate.

## Where to change registration

- To add/remove auto‑imported directories, edit: `src/config/composables-config.ts`.
- To see the full current set, inspect files under: `src/runtime/composables/**` and `src/runtime/utils/**`.

---

Last updated: based on main branch at time of writing.
