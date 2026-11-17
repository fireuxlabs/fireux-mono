# FireUX predictable-spine architecture — conversation handoff

Date: 2026-11-17
Status: architectural discussion handoff; **not authorization for source moves, data migrations, deployment, or blanket renaming**
Context: follow-up to [FireUX spine migration plan](../roadmaps/fireux-spine-migration.md) and [architectural reset](2026-11-12-fireux-architectural-reset.md).

## Purpose

Capture the decisions and design preferences discussed after the spine migration plan was written, so Codex can reconcile them with current source and maintained canon before implementing bounded changes.

**Aim:** make FireUX a predictable, opinionated extension of Nuxt, Nuxt UI and Firebase, not a parallel framework. Invest now in clear ownership, naming, lifecycle and discovery contracts so future apps can be built quickly and consistently. Do not equate strong architecture with more layers or mandatory boilerplate.

## Agreed architectural direction

1. **FireUX package runtime = native Nuxt spine + explicit Entity roots.** Keep native Nuxt pages, layouts, middleware, plugins, server API and framework discovery in their supported places. Shared FireUX mechanics stay at their real shared owner. No duplicate routing, import or state-management framework.
2. **Entity roots are flat at the owning package runtime level.** A first-class Entity has a named root and only the relevant Nuxt-style technical roles (components, composables, model, domain server behavior, utilities, etc.). Entity source does **not** contain a second Entity spine. A business or Firestore hierarchy is not a source tree hierarchy. Related Entities may sit as siblings, even where one is stored beneath another.
3. **Entity, owned Record and embedded Shape are different concepts.** An Entity has its own identity/authority/lifecycle; its canonical model belongs with it. A Record is owned by an Entity and has a definition under the owner's optional `records/`; its readers, components, commands and workflows belong in the owner's existing technical roles, **not** a miniature spine under `records/`. Embedded Shapes/types sit by the model, record or capability that owns them. A Record is an architectural classification, not a synonym for Firestore document or TypeScript `Record<...>`.
4. **No architectural `Sub-Entity` class.** Previous language was ambiguous. If something is a real Entity, flatten its source root alongside siblings; if it is parent-owned support truth, treat it as a Record. Neither being nested in Firestore nor having a stable ID is enough to classify it.
5. **One canonical authority; multiple consumers.** Referencing or displaying another owner's truth does not transfer ownership. Entity domain logic should reuse Core mechanisms and other Entities' supported interfaces, not reach into another owner's internal state or duplicate writes.
6. **Paths and public names tell the same story:** Entity → audience (such as Workspace, where relevant) → capability → child. For example, `kitchen/components/Workspace/Menu/Index.vue` resolves to `KitchenWorkspaceMenu`; `kitchen/composables/workspace/menu/index.ts` exports `useKitchenWorkspaceMenu()`. Preserve native Nuxt naming/registration behavior; inspect generated declarations and auto-import behavior rather than inventing resolvers or alias barrels.
7. **Lean, substantially self-contained Vue components are preferred.** Keep templates and parent pages easy to read. When the component owns meaningful reactive coordination, a same-named composable is a good home for it (e.g. `KitchenWorkspaceMenu` ↔ `useKitchenWorkspaceMenu`). This is **optional, not one composable per Vue file**. Small computed values and local event handling can stay in `<script setup>`; pure display children can take typed props/events.
8. **Child composables delegate to responsible parents/domain owners.** A child can consume a strictly provided parent capability or call existing domain composables. It must not silently create a second parent acquisition, publisher, authority, listener or command. The root/parent owns shared scope and lifetime; children own their specific projections and interactions. Downward dependency into shared domain mechanics, never domain logic depending on component-specific wrappers. Avoid both prop drilling of large controller objects and hidden duplicate acquisition; use explicit props for genuine inputs and presentational reuse.
9. **Rules over symmetry.** Do not create empty directories, token `useX()` facades, passive forwarding wrappers, compulsory CRUD files, or an elaborate abstraction only to satisfy the diagram. Every new boundary must have an owner, job, real consumer and reason not to reuse an existing boundary.
10. **Architecture is only complete with behavior.** Verify real routes/components, component/import registration, auth/authorization, exact mutation target, reactive sharing, SSR/hydration, disposal, stale completion and meaningful desktop/mobile UI interaction. Code shape and typechecks alone do not prove fit.

## Concrete decisions and examples

- **Kitchen Item** is a **Kitchen-owned Record**, not a standalone `runtime/item/` Entity. Kitchen owns its canonical identity and lifecycle; Menu placement references it. Removing an Item from one Menu must not delete the canonical Kitchen Item. Preserve current persisted `kitchens/{kitchenId}/dishes/{dishId}` in a source-only cutover.
- **Menu** remains a separate **Entity** in `runtime/menu/` even where its records are Kitchen-scoped. Kitchen Workspace Menu composes Menu capability. A `MenuItem` is a Menu placement/reference, distinct from the Kitchen Item itself; avoid copied canonical item truth.
- **Recipe** is a real **Entity** and should have its own sibling source spine even while today's readers/storage remain Kitchen-scoped. Source flattening does not grant independent read/write authority or change database storage. Settle independent ownership, Kitchen association, provenance and deletion before a data cutover.
- **Ingredient** retains its shared canonical Entity owner. **Preparation** classification is still undecided; examine whether reusable preparation output is Kitchen-owned Record or a standalone Entity. Do not settle it by current directory or Firestore path.
- Existing examples of composable delegation: `useKitchenWorkspaceItems` composes Kitchen Workspace, access, Item collection and page helpers; `useKitchenWorkspaceMenus` composes Workspace, identity and Menu operations; `useKitchenWorkspaceCalendar` adapts Core's `useWorkspaceCalendar`. These prove delegation, **not** automatic endorsement of every current export name.
- Potential component-alignment examples for **bounded review, not automatic refactoring**: `kitchen/components/Menu/Items/Menu.vue` contains section acquisition, reactive aggregation and watchers; `kitchen/components/Menu/Menus/Items/Edit/Row.vue` accepts a full editor controller and builds its own actions. Test whether a responsibility-matched composable or strict shared context simplifies each without duplicating acquisition.
- Core already has App/User/Ecosystem Entity roots according to current maintained maps; do not assume Core has no Entities merely because its root shares much of Nuxt's technical spine.

## Open questions — do not silently decide

1. **Workspace status:** Is it best described as a first-class shared FireUX capability/surface or simply a composition pattern? Existing runtime map describes Core `workspace/` as a shared owner **not an Entity**. Inspect source and consumers before changing the contract. Entity-owned Workspace experiences remain under the Entity, and the existence of an admin dashboard does not mandate a Workspace Entity.
2. **Preparation:** Record or separate Entity? Decide from ownership, identity, lifetime and reuse.
3. **Recipe authority:** independent owner and editing policy; how a Kitchen associates with a Recipe without duplicating canonical truth.
4. **Naming/shape details:** choose one minimal convention for canonical `models/model.ts`, `records/item.ts`, colocated field/transport types and generated public names. Do not introduce redundant filename suffixes or generic types roots by default.
5. **Component composable scope:** when is matching composition actually useful, and how does the child consume its parent without hidden second reader/command construction? Preserve the existing provided-parent lifecycle and distinguish independent public lower readers from injected child projections.

## Suggested handoff to Codex

Read `AGENTS.md`, `docs/ai/gpt-context.md`, the maintained concept graph and current [migration plan](../roadmaps/fireux-spine-migration.md). Inspect the **live** checkout, concurrent work, actual modules/scans, source and consumers; remote commits may not include uncommitted Kitchen work. Compare this discussion with `docs/concepts/entities.md`, `runtime-filesystem.md`, `components.md`, `composables.md`, `family-workspace-entity.md` and the Misebox scoped context. Older maps may still classify Dish/Recipe/Preparation differently or use suffix-first composable names.

First report a decision matrix: **accepted / already implemented / drift / to-confirm**, with source evidence and affected consumer boundaries. Reconcile the canon **before** source migration. Then use one complete Kitchen Menu or Item owner-and-consumer slice as proof, coordinating with the active Kitchen work. Keep routing, storage, mutation authority and behavioral contracts unchanged unless a separate reviewed migration is authorized. Follow with Recipe only after the authority/association questions are answered. No blanket repository rewrite, unreviewed stored-data mutation, deployment or restart is authorized by this file.

## Guiding quality test

A developer or coding agent unfamiliar with FireUX should independently arrive at the same answer to: **Who owns this? Where does it live? What is it named? How does it acquire/act? How is its correctness proved?** When the answer requires special historical knowledge, the rule or implementation still needs alignment.
