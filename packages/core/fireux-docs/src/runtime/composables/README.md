# Composables Directory

Authority: Operational
Updated: 2026-05-27
Scope: `packages/*/fireux-*/src/runtime/composables` only.

This page documents FireUX rules for `runtime/composables/`.
It does not explain general Nuxt composable behavior.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX composable structure and canon seams.

## FireUX Rule

`runtime/composables/` is where FireUX reads, writes, adapters, app context helpers, and entity-owned authoring helpers live.

The main FireUX concern is not “what a composable is.”
It is “which seam belongs where.”

## FireUX Top-Level Split

Core FireUX composable structure is:

```text
runtime/composables/
  dev/
  shared/
  fireux/
```

Read that split like this:

- `dev/`
  developer-only helpers and inspection tools
- `shared/`
  truly generic helpers
- `fireux/`
  actual FireUX product, entity, app, and console seams

Loose top-level composable files should not live beside `dev/`, `shared/`,
and `fireux/`.

## Runtime Composables Placement

Current placement canon:

```text
src/runtime/composables/
  dev/
  fireux/
  shared/
```

Meaning:

- `dev/` is for dev tooling, debug, inspection, drift, mock, and test helpers.
- `fireux/` is for FireUX product, runtime, data, entity, and console composables.
- `shared/` is for neutral reusable composables usable by both `dev/` and `fireux/`.

Current audit verdict:

- `dev/` is clean enough to leave alone.
- `shared/` is mostly clean.
- There is no blocker before moving into `composables/fireux/` canonisation.

Known follow-ups:

- `shared/useCollectionRouteContext.ts` is FireUX-aware-ish because it understands `/console` route semantics. Later, consider moving it under a FireUX app, console, or navigation helper path after checking imports.
- `shared/useInterfaceUtils.ts` can stay for now. Later, review whether profile/entity formatting should split from neutral string and array helpers.

Roadmap:

1. Leave `dev/` and `shared/` alone for now.
2. Start repo-wide audit inside `composables/fireux/`.
3. Canonise normal Firestore entity composables as the usual root entity stack:

```text
composables/fireux/firestore/<entity>/
  useX.ts
  fetch/
    useXFetch.ts
    useXCollection.ts
    search/            optional, if search is real read behaviour
  mutations/
    useXCreate.ts
    useXUpdate.ts
    useXPublish.ts    optional, only for public/indexable publication
    useXDelete.ts
    validation/        optional, only for write-specific validation
  utils/
    useXSeo.ts         optional, only for public entity metadata/JSON-LD
    view/
      useXComputed.ts
      useXInterface.ts
    validation/        shared entity validation
    normalize/         optional
    paths/             optional
```

4. Put console-backed entity runtime seams and operation data in a separate console stack:

```text
composables/fireux/console/<entity>/
  useXConsole.ts
  useXConsoleIndex.ts
  useXConsoleOverview.ts
  useXSelection.ts
  operations/
```

5. Keep shared app/runtime composables under `fireux/app/`.

```text
composables/fireux/app/<context>-runtime/
composables/fireux/app/console/
```

6. Keep shared pricing explanation helpers under `fireux/pricing/`.

```text
composables/fireux/pricing/
  useEcosystemPricingPage.ts
```

7. Only after `fireux/` is stable, revisit the small `shared/` follow-ups.

## FireUX Canon Seams

Important FireUX seams include:

- `useXFetch`
  read one entity or one read seam
- `useXCollection`
  read collections
- `useX`
  singular family entry seam that gathers the entity stack
- `useXComputed`
  derived entity truth such as status/display booleans
- `useXInterface`
  adapt read truth into UI surfaces
- `useXSelection`
  remember selected console target
- `useActiveX`
  resolve active target/runtime path
- `useXConsole`
  adapt active target into console-facing state

The important FireUX rule is:

- stored truth belongs in models
- read and write behavior belongs in composables
- UI shaping belongs in interface seams
- UI rendering belongs in components

## FireUX Override

FireUX adds structure on top of ordinary composable usage:

- `src/runtime` is a delivery area, not an ownership bucket; composable ownership is decided by surface and family
- console state gets explicit seams rather than ad hoc page logic
- Firestore reads and writes stay explicit under `fireux/firestore/`
- Firestore operation is the primary family:
  - Create: `useXCreate`, with `useFirestoreCreate` and `useFirestoreApiCreate` as lower-level helpers
  - Read: `useXFetch`, `useXCollection`, `useFirestoreRead`
  - Update: `useXUpdate`, `useFirestoreUpdate`
  - Delete: `useXDelete`, `useFirestoreDelete`
- transport is a variant inside the operation family:
  - direct/client Firestore uses VueFire or the client SDK
  - server/API-mediated Firestore uses a client composable plus a Nuxt server route for privileged, storage, provider, cross-app, or public-safe work
- record location is a separate axis from operation and transport:
  - root records live at paths such as `menus/{menuId}` or `kitchens/{kitchenId}`
  - parent-scoped records live under a parent such as `kitchens/{kitchenId}/menus/{menuId}`
  - app-scoped records live under an app path such as `apps/{appId}/kitchens/{kitchenId}/menus/{menuId}`
  - hydrated read shapes are composed at read time and are not stored families
- Firestore read helper names must describe their runtime semantics:
  - `firestoreFetchCollection`, `firestoreFetchDoc`, and `firestoreQuery` are reactive VueFire read bindings
  - `firestoreLoadDocsByIds` is an exact-doc loader that reloads when path/ids change, but is not a live listener for later document updates
- usual Firestore entity stacks stay boring: root `useX.ts`, `fetch/`, `mutations/`, and `utils/`
- singular/plural read dimensions live inside the stack: `useXFetch` reads one and `useXCollection` reads many
- create surfaces should keep the domain seam stable: pages call `useXCreate`, while `useXCreate` owns Create behavior
- Create behavior is out of the box by default; normal creates do not need a plan just to say they are normal
- some Create seams are idempotent, and some include provision behavior
- `useFirestoreCreate` is a direct-client primitive only: it handles collection path, generated vs known id writes, stamp options, database id, and stripping persisted `id`
- `useFirestoreCreate` must not own idempotent setup behavior, provision behavior, server/API transport, storage upload, external provider logic, slug validation, entity validation, or overlay composition
- `createDocument(collectionPath, data, opts)` means generated id; `setDocument(collectionPath, id, data, opts)` means known id
- `fireux/firestore/operations/createStrategy` remains the create-specific vocabulary helper; use it to mark non-default Create family behavior with `family`
- optional descriptors such as `transport`, `location`, `id`, and `steps` should be used only when they clarify something non-obvious
- entity families keep business rules and may delegate plain writes to `useFirestoreCreate` or API-mediated writes to `useFirestoreApiCreate`
- `public` describes route visibility, rendering, or publication status; it must not be used as a storage-location family label
- publish surfaces should keep the same shape: pages call `useXPublish`, while `useXPublish` owns entity readiness rules and can delegate shared write mechanics to core `fireux/publishing/usePublish`
- sitemap registration must use explicit publication truth such as `show === true` or `visibility === 'public'`; missing publication fields must not fall back to slug presence
- validation belongs in `utils/validation` when it is shared by UI/read/write surfaces, and in `mutations/validation` only when it protects write behaviour
- console-backed entity runtime seams live at the root of `fireux/console/<entity>/`
- console operation records live under `fireux/console/<entity>/operations/`, not as child buckets under `fireux/firestore/<entity>/`
- console operation stacks may have entity-specific child folders under `operations/`, but not vague architecture buckets such as `runtime-*`, `facade`, `stack`, `manager`, `processor`, `handler`, or `resolver`
- FireUX app/runtime helpers stay explicit under `fireux/app/`
- `fireux/app/` is not a dumping ground for entity create/edit/editor state; normal entity authoring helpers belong to the entity family first
- generic helpers should not quietly absorb FireUX-specific behavior

## What This README Should Answer

Use this branch README when the question is:

- should this logic live in a composable at all
- is this helper generic, FireUX-specific, or developer-only
- which FireUX seam owns this read, write, selection, or console behavior

If the question is only about `ref`, `computed`, or normal composable syntax, that belongs to Nuxt or Vue docs instead.

## Short Version

`runtime/composables/` is where FireUX runtime logic lives.

The FireUX job here is seam ownership, not general composable education.
