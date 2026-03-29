# Entity Classes Report
Authority: Tier2 (Operational audit)
Updated: 2026-03-16

Purpose: classify current model files against the `Root`, `Runtime Child`, and `Dual-Layer` canon and flag the drift that makes the repo feel like multiple teams designed it.

References:
- `docs/contracts/entity-classes.md`
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`

## Summary
- Total model files reviewed: 40
- Tagged as `Root`: 17
- Tagged as `Runtime Child`: 9
- Tagged as `Dual-Layer`: 7
- Tagged as `Other`: 7

## Main Findings
1. Dual-layer drift is the highest-risk alignment problem.
   - `Agent`, `Professional`, and `Portfolio` still mix interface-first and const-derived styles.
   - `User` now matches the `Core` plus `App` dual-layer contract and becomes the reference shape for profile overlays.
   - `App` has been redesigned as root-only; the remaining dual-layer work is now concentrated in profile and tenant entities.

2. Runtime child entities are cleaner structurally than dual-layer entities, but some parent-owned business domains still look root-shaped.
   - `Task`, `DocumentLink`, `KitchenMiseTask`, `Menu`, `Dish`, `KitchenCostSnapshot`, `KitchenTeamMember`, `KitchenOrder`, and `Recipe` all read as runtime child models.
   - `Recipe` is currently locked as kitchen-owned canonical data with public projection surfaces only; dual-residence is intentionally deferred.

3. Several files are mixed or wrapper-style and should not be treated as first-class canonical entity models.
   - Supplier profile wrapper re-exports the real supplier model and should not look like an independent entity family.
   - `ingredient.model.ts` currently mixes one root entity with runtime child link models in a single file.

4. Stamp and naming drift remains widespread.
   - interface-first models coexist with const-derived models.
   - some files keep flat `created_at` and `updated_at` compatibility fields as active surface area.
   - `updated.by` is sometimes typed from `created` instead of `updated`.

## Classification Table
| File | Class | Notes | Drift Flags |
| --- | --- | --- | --- |
| `packages/core/fireux-core/src/runtime/models/core/app.model.ts` | Root | Canonical root app entity | canonical root reference |
| `packages/core/fireux-core/src/runtime/models/system/ecosystem.model.ts` | Root | System registry ecosystem record | interface-style drift, flat timestamp drift |
| `packages/core/fireux-core/src/runtime/models/system/module.model.ts` | Root | Registry-only root marker | interface-style drift |
| `packages/core/fireux-core/src/runtime/models/system/project.model.ts` | Root | Project registry root | interface-style drift, flat timestamp drift |
| `packages/ecosystem/fireux-cleanbox/src/runtime/models/location.model.ts` | Root | Tenant-level standalone entity | interface-style drift, flat timestamp drift |
| `packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts` | Root | Canonical blog entity | interface-style drift, flat timestamp drift |
| `packages/extensions/fireux-companies/src/runtime/models/company.model.ts` | Root | Thin root record on Place | interface-style drift |
| `packages/extensions/fireux-compliance/src/runtime/models/compliance-record.model.ts` | Root | Currently modeled as standalone record | parent-owned semantics drift |
| `packages/extensions/fireux-documents/src/runtime/models/document.model.ts` | Root | Currently modeled as standalone record | parent-owned semantics drift |
| `packages/extensions/fireux-jobs/src/runtime/models/job.model.ts` | Root | Canonical root job entity | none |
| `packages/extensions/fireux-places/src/runtime/models/place.model.ts` | Root | Strong canonical root entity | updated stamp typing drift |
| `packages/extensions/fireux-products/src/runtime/models/product.model.ts` | Root | Canonical product entity | interface-style drift, flat timestamp drift |
| `packages/extensions/fireux-properties/src/runtime/models/client.model.ts` | Root | Currently modeled as standalone client record | interface-style drift, optional stamp drift |
| `packages/extensions/fireux-properties/src/runtime/models/property.model.ts` | Root | Canonical property entity in current repo style | parent-owned semantics ambiguity |
| `packages/extensions/fireux-properties/src/runtime/models/unit.model.ts` | Root | Canonical unit entity in current repo style | parent-owned semantics ambiguity |
| `packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts` | Root | Root ingredient plus child link records in one file | mixed-class file |
| `packages/extensions/fireux-orders/src/runtime/models/order.model.ts` | Root | Canonical root order entity | no app overlay, minimal stamps |
| `packages/extensions/fireux-documents/src/runtime/models/document-link.model.ts` | Runtime Child | Relationship record tied to owning document or portfolio context | path not explicit in header |
| `packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts` | Runtime Child | Kitchen-owned operational entity | none |
| `packages/extensions/fireux-kitchens/src/runtime/models/kitchen-cost.model.ts` | Runtime Child | Kitchen-owned cost snapshot | none |
| `packages/extensions/fireux-kitchens/src/runtime/models/kitchen-mise.model.ts` | Runtime Child | Kitchen runtime task | none |
| `packages/extensions/fireux-kitchens/src/runtime/models/kitchen-team.model.ts` | Runtime Child | Kitchen-owned team member | none |
| `packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts` | Runtime Child | Kitchen-owned menu | none |
| `packages/extensions/fireux-kitchens/src/runtime/models/order.model.ts` | Runtime Child | Kitchen-owned operational order | flat timestamp drift |
| `packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts` | Runtime Child | Canonical kitchen-owned recipe authoring model | canonical recipe reference |
| `packages/extensions/fireux-tasks/src/runtime/models/task.model.ts` | Runtime Child | Parent-owned operational task candidate | path not explicit in header |
| `packages/core/fireux-core/src/runtime/models/core/user.model.ts` | Dual-Layer | User core plus app membership overlay | canonical dual-layer reference |
| `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts` | Dual-Layer | Agent core plus app overlay | interface-style drift, app overlay too thin |
| `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts` | Dual-Layer | Professional core plus app overlay | interface-style drift, app overlay too thin |
| `packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts` | Dual-Layer | Kitchen core plus app overlay | good reference model |
| `packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts` | Dual-Layer | Chef core plus app overlay | mixed style with const-derived types but no alias |
| `packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts` | Dual-Layer | Portfolio core plus app overlay | interface-style drift |
| `packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts` | Dual-Layer | Supplier core plus app overlay | no `Supplier` alias, large legacy payload |
| `packages/core/fireux-core/src/runtime/models/core/meta.model.ts` | Other | Shared stamp contract | support model |
| `packages/core/fireux-core/src/runtime/models/core/profile.model.ts` | Other | Shared profile base contract | support model |
| `packages/core/fireux-core/src/runtime/models/shared/pill.model.ts` | Other | Shared view protocol | support model |
| `packages/core/fireux-core/src/runtime/models/shared/task.model.ts` | Other | Shared base task protocol | support model |
| `packages/core/fireux-core/src/runtime/models/system/meta-content.model.ts` | Other | Meta content contract, not an entity | support model |
| `packages/extensions/fireux-suppliers/src/runtime/models/profiles/Supplier/Supplier.model.ts` | Other | Re-export wrapper only | duplicate wrapper model |

## Priority Drift Targets
### First pass: Dual-Layer normalization
- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts`
- `packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts`
- `packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts`
- `packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts`

Reasons:
- these entities carry the highest naming drift
- they most strongly define the feeling of one team or many teams
- they should converge on `EntityCore` and `EntityApp` with const-derived types

### Second pass: Root normalization
- `packages/core/fireux-core/src/runtime/models/system/ecosystem.model.ts`
- `packages/core/fireux-core/src/runtime/models/system/project.model.ts`
- `packages/extensions/fireux-products/src/runtime/models/product.model.ts`
- `packages/extensions/fireux-blogs/src/runtime/models/blogPost.model.ts`

Reasons:
- these still read as a separate interface-first style family

### Third pass: Runtime child normalization
- `packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts`
- `packages/extensions/fireux-kitchens/src/runtime/models/order.model.ts`
- `packages/extensions/fireux-documents/src/runtime/models/document-link.model.ts`
- `packages/extensions/fireux-tasks/src/runtime/models/task.model.ts`

Reasons:
- these already mostly fit the child pattern and need smaller cleanup passes

## Recommended Repo Lock
1. Add `docs/contracts/entity-classes.md` to the regular alignment workflow.
2. Require every new entity model to declare `Root`, `Runtime Child`, or `Dual-Layer` in its header.
3. Prefer `const object + derived type` for all new model work.
4. Treat wrapper files and projections as `Other` until they are renamed or moved out of canonical model namespaces.
