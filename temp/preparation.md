# Index canon feasibility (FireUX)

Date: 2025-12-29
Scope: runtime pages + runtime components only (no docs besides this file).

## Summary (worth doing now?)
Yes — a partial rollout is worth doing now.

Why:
- The repo already has the building blocks (CTA components, Preview components, and `Sections/*Collection.vue` components), but index pages still contain orchestration logic (toggles, tenant/global rules, debug panels).
- Standardising the composition to `Header + CTA + CollectionManager` reduces duplication and makes it easier to keep UX consistent across domains.
- This can be rolled out incrementally (domain-by-domain) with minimal risk by adding wrapper organisms first, then simplifying pages.

Why not “full rewrite” right now:
- Some pages (e.g. Professionals) include debug panels and extra toggles that need careful preservation.
- Some CTAs are currently hidden at the index level; moving gating inside CTA components is a UX decision that should be made intentionally.

## 1) Canon term decision: **Collection**
Pick: **Collection** (single term).

Justification:
- The UI is driven by Firestore collections (e.g. `/users`, `/apps`, `/places`, domain-specific collections).
- The repo already uses the term in component names: `*Collection.vue`, `Sections/*Collection.vue`, and “Collection Manager” maps naturally to “owns local/global sections + list rendering”.
- “Directory” is used for profile browsing (Agents/Professionals) but it’s a specialized *kind* of collection view; keeping one canon term avoids per-domain vocabulary drift.

Naming rule:
- Page-level wrapper should be `CollectionManager`.
- Renderers that actually draw the items can stay `List` / `CardsList` internally, but indexes should not reference them directly once a manager exists.

## 2) Current index patterns (repo scan)

### Objects
- Blog index: packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue
  - `OrganismsObjectsBlogCTA v-if="canPublishBlog"`
  - `OrganismsObjectsBlogList`

- Products index: packages/extensions/fireux-products/src/runtime/pages/products/index.vue
  - `OrganismsObjectsProductCTA v-if="showCTA"`
  - `OrganismsObjectsProductCardsList`

- Jobs index: packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue
  - `OrganismsObjectsJobCTA v-if="coreProfile"`
  - `OrganismsObjectsJobSectionsAgentCollection v-if="coreProfile"`
  - `OrganismsObjectsJobSectionsGlobalCollection`

- Places index: packages/extensions/fireux-places/src/runtime/pages/places/index.vue
  - CTA-like organism: `OrganismsObjectsPlaceSearchSection` (not named CTA)
  - List organism: `OrganismsObjectsPlaceList` (prop-driven)

### Profiles / directories
- Agents index: packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue
  - `OrganismsProfilesAgentPreview`
  - `OrganismsProfilesAgentSectionsLocalCollection v-if="isTenant"`
  - toggle + `OrganismsProfilesAgentSectionsGlobalCollection`

- Professionals index: packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue
  - `OrganismsProfilesProfessionalPreview`
  - local collection gated by computed `showLocalDirectory`
  - toggle for global collection
  - debug panel (raw JSON + clipboard)

### Core
- Users index: packages/core/fireux-core/src/runtime/pages/users/index.vue
  - `OrganismsUserPreview`
  - toggle for global directory
  - `OrganismsUserCollection`

- Apps index: packages/core/fireux-core/src/runtime/pages/apps/index.vue
  - `OrganismsAppPreview`
  - `OrganismsAppCollection`

### Also present (ecosystem packages)
These follow the same “Preview + LocalCollection + GlobalCollection + toggle” pattern:
- packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue

## 3) Existing organisms we can reuse (no guessing)

### CTAs
- Blog CTA component: packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CTA.vue
  - CTA is also conditional inside the component (`UPageCTA v-if="showCTA"`).
- Product CTA component: packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/CTA.vue
  - CTA conditional inside component (`UPageCTA v-if="showCTA"`).
- Job CTA component: packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CTA.vue
  - Branches internally: shows `OrganismsProfilesAgentCTA` if missing agent profile, else shows “Post a job” CTA.

### Lists / collections / sections
- Blog list: packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/List.vue
- Products cards list: packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/List.vue
- Places list: packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/List.vue
- Jobs sections collections:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/AgentCollection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/GlobalCollection.vue
- Profile sections collections:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Sections/{LocalCollection,GlobalCollection}.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Sections/{LocalCollection,GlobalCollection}.vue

### Previews
- Agent preview: packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Preview.vue
  - Already contains conditional “create profile” CTA inside.
- Core previews:
  - packages/core/fireux-core/src/runtime/components/organisms/User/Preview.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Preview.vue

## 4) Proposed canon names + new wrapper components

### Objects
For each object domain:
- `components/organisms/objects/<Domain>/CTA.vue`
- `components/organisms/objects/<Domain>/CollectionManager.vue`

Concrete proposals (new files):
- Places (pilot):
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/CTA.vue
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/CollectionManager.vue

- Blog:
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CollectionManager.vue

- Products:
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/CollectionManager.vue

- Jobs:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CollectionManager.vue

### Profiles
For each profile domain:
- `components/organisms/profiles/<Domain>/CTA.vue`
- `components/organisms/profiles/<Domain>/CollectionManager.vue`

Concrete proposals (new files):
- Agent:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/CollectionManager.vue

- Professional:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/CollectionManager.vue

### Core
For core directories:
- packages/core/fireux-core/src/runtime/components/organisms/User/CollectionManager.vue
- packages/core/fireux-core/src/runtime/components/organisms/App/CollectionManager.vue

## 5) Page updates (exact file paths)

Update these pages to become lean:

- Blog:
  - packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue
    - Target:
      - `<OrganismsObjectsBlogCTA />`
      - `<OrganismsObjectsBlogCollectionManager />`

- Products:
  - packages/extensions/fireux-products/src/runtime/pages/products/index.vue
    - Target:
      - `<OrganismsObjectsProductCTA />`
      - `<OrganismsObjectsProductCollectionManager />`

- Jobs:
  - packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue
    - Target:
      - `<OrganismsObjectsJobCTA />` (always rendered)
      - `<OrganismsObjectsJobCollectionManager />`

- Places:
  - packages/extensions/fireux-places/src/runtime/pages/places/index.vue
    - Target:
      - `<OrganismsObjectsPlaceCTA />`
      - `<OrganismsObjectsPlaceCollectionManager />`

- Agents:
  - packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue
    - Target:
      - `<OrganismsProfilesAgentCTA />` (or keep Preview-only; see minimal plan)
      - `<OrganismsProfilesAgentCollectionManager />`

- Professionals:
  - packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue
    - Target:
      - `<OrganismsProfilesProfessionalCTA />` (optional; can keep Preview)
      - `<OrganismsProfilesProfessionalCollectionManager />` (owns toggle + debug)

- Core:
  - packages/core/fireux-core/src/runtime/pages/users/index.vue
    - Target: Preview + CollectionManager (manager owns toggle)
  - packages/core/fireux-core/src/runtime/pages/apps/index.vue
    - Target: Preview + CollectionManager

## 6) File removal plan (only after rollout)

Do NOT delete on the minimal first pass.

After each domain is migrated and stable, candidates to remove:

- Places:
  - If Place CTA is introduced as a wrapper around Search/Section:
    - Keep `packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Section.vue` (still used inside CTA).
    - No deletes required.

- Blog:
  - `packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/List.vue` likely stays (used by CollectionManager).
  - No deletes required.

- Products:
  - `packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/List.vue` stays.

- Jobs:
  - `packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/{AgentCollection,GlobalCollection}.vue` stay.

- Agents/Professionals:
  - Section components stay.
  - Preview components stay.

Net: the canon is mostly wrappers + page simplification; deletes are minimal.

## 7) Required move/rename operations (git mv list)

Minimal-first-pass can avoid any `git mv` by adding wrappers.

If you want strict naming canon (optional), these are the likely moves:
- Places:
  - `packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Section.vue`
    -> `packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/CTA.vue`
  - (OR) keep Search/Section and add a wrapper CTA component to avoid renaming.

Recommended approach: **no moves initially**. Add `CTA.vue` wrappers and keep existing files.

## 8) Back-compat concerns (Nuxt auto-import component names)

- Component tags are derived from paths. Renaming/moving a component changes its tag.
  - Example: moving `.../objects/Place/Search/Section.vue` changes `OrganismsObjectsPlaceSearchSection`.
- To avoid breaking imports/usages:
  - Prefer adding new wrapper components at the canonical path, and keep existing components in place.
  - If you do rename/move, you must update all usages across runtime pages/components.

## 9) Minimal first pass (prove the pattern with the smallest change)

Pilot domain: **Places** (already close to the target shape).

Steps:
1) Create `packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/CTA.vue`
   - Internally renders `OrganismsObjectsPlaceSearchSection`.
   - CTA should always be visible; permission gating (if any) lives inside.
2) Create `packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/CollectionManager.vue`
   - Internally uses the existing list organism `OrganismsObjectsPlaceList`.
   - Owns `usePlaces({ keyword, type: null })` and empty states.
3) Update `packages/extensions/fireux-places/src/runtime/pages/places/index.vue`
   - Becomes: Header + CTA + CollectionManager.

Success criteria:
- `/places` index contains almost no orchestration.
- Create still works (Google confirm -> ensure doc -> list updates).

## 10) Full rollout plan (domains + order)

1) Places (pilot, low surface area)
2) Blog (simple CTA + list; remove page-level `v-if` around CTA)
3) Products (simple CTA + list; remove page-level `v-if` around CTA)
4) Jobs (wrap existing sections in a manager; decide whether CTA always renders)
5) Agents (move toggle logic into manager)
6) Professionals (move toggle + debug into manager)
7) Core Users/Apps (move toggle into manager)
8) Ecosystem profile directories (chefs/suppliers) if desired

## Notes on conditional CTA behaviour (your stated preference)

Current reality:
- Page-level gating exists on:
  - Blog index, Products index, Jobs index.
- Some CTA components are also conditional internally:
  - Blog CTA, Product CTA.

Canon recommendation:
- Index pages should always render the domain CTA component.
- The CTA component should always render a frame (`UPageCTA` or similar) and decide internally whether it shows:
  - primary action buttons,
  - a permission message,
  - or a “set up your profile” action.

This keeps indexes lean and keeps permission UX consistent.
