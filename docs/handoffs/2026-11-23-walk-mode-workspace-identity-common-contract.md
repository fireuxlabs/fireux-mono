# Walking-mode handoff — Shared Workspace Identity & Brand contract audit

Date: 2026-11-23
Status: **Proposal for Codex review on return to desktop** — not an instruction to migrate data immediately
Preceding handoff: `docs/handoffs/2026-11-23-walk-mode-workspace-identity-boundaries.md`
Order: shared Identity design and Kitchen cleanup → Items → Menus → Services → Public Kitchen.

## User direction

We want a simple reusable *standard* for Identity & Brand across Workspace Entities, with a **domain delta** for fields that are special to Kitchen, Supplier, Business, Project, Portfolio, or Property. We are designing the desired target, not providing permanent backward compatibility for old Firestore document shapes. Do not create two competing authorities or a second Workspace Entity document.

**Open design question (raised during walking mode):** `context` belongs in the common review, but it should **not be categorically classified as internal**. Rich, verified, publishable Entity context may help people, search engines and agents understand an Entity. Distinguish public contextual content from private operational notes and confidential AI instructions. Decide ownership, authoring, publication, and safe public projections explicitly before implementation; never expose all context indiscriminately.

## Confirmed repository inventory

| Workspace Entity | Identity as currently modeled | Candidate domain delta / nuance |
|---|---|---|
| Kitchen | Flat root `id`, `name`, optional `slug`, `status`, `visibility`, `description`, `imageUrl`, `placeId`, `context` | May exist with no Place. `cuisines` is a proposed Kitchen-specific discoverability field, **not yet confirmed in the new model**. Operating hours and service availability belong to their actual capabilities, not general Identity. |
| Business | Flat `id`, `name`, `description`, `email`, `phone`, `website`, `place_ids[]`; no `context` field in the inspected canonical Business model | Zero/one/many linked Places; contact fields and Place relationships must retain real ownership. Consider adding context with explicit private/public treatment to desired target after consumer review, not by inventing current support. |
| Supplier | Root `business_id`, nested `identity` containing `slug`, `status`, `visibility`, optional root `context`. Workspace name, description and image currently derive from linked Business/Place | Supplier identity presentation is not independently authoritative for Business or Place's public name/media. Supplier-specific catalogue mode/delivery area are separate domain capabilities, not generic Identity. |
| Project | Nested `identity` with `name`, `description`, `image_url`, `status`; optional root `context` | Current status has 'active' and 'inactive'; guest ownership authority is not public Identity. No canonical slug or Place in inspected model. |
| Portfolio | Nested `identity` with `name`, `tagline`, `image_url`, `slug`, `owner_label`, `status`, `strategy_label`, `region_label`, `notes`; optional root `context` | Owner/strategy/region labels and private notes are Portfolio-specific. |
| Property | Nested `identity` with `name`, `image_url`, `slug`, `status`, `publication_state`, `property_type`, `unit_count`; optional root `context`; root `place_id` | Property type, unit count and publication policy are Property-specific. Current Property creation requires Place; Kitchen does not. |

Repo evidence: `kitchen/models/kitchen.model.ts`, `business/models/business.model.ts`, `supplier/models/Supplier.model.ts`, `project/models/project.model.ts`, `portfolio/models/portfolio.model.ts`, `property/models/property.model.ts` within their respective `packages/extensions/fireux-*/src/runtime/` folders.

## Proposed common interface

Consider one **common typed interface / read contract** for Workspace Identity, rather than a universal persisted `identity` object or second database document:

```ts
export type WorkspaceIdentityCore = {
  id: string
  name: string
  description?: string
  imageUrl?: string
  /** Rich Entity background; publication policy to be decided. */
  context?: string
}
```

This is a **target convention to review**, not yet an accepted migration schema. `id` and `name` are baseline. `description`, `imageUrl`, `context` may be optional, especially for Entities whose public presentation draws from a linked authority. If adopting flattened root fields across every domain, audit every existing consumer and ownership boundary first.

Other commonly useful *optional facets*, not baseline requirements:
- `slug`: public routing only where used; uniqueness and URL namespace are domain-specific.
- `status`: lifecycle, domain-specific enum; do not collapse Property's publication state into it.
- `visibility`: public discovery/access policy; enum and defaults require deliberate decisions.
- `tagline`, `logoUrl`, `coverUrl`, `wordmarkUrl`, `gallery`, `brandPalette`: richer brand presentation with an explicit owning Entity or Appearance capability; avoid independently editable duplicates.

**Do not treat `context` as `description`.** Description is a short public summary. Context can contain richer, factual background; some of it may merit publication as an About section or other visible page content, while operational secrets and internal instructions remain private. A saved `context` field alone does not boost SEO: only deliberately published, crawlable, helpful content can aid discovery. Public semantic content should be rendered in visible text, with matching structured data where appropriate, never placed solely in machine-only markup. Review whether `context` is itself public and vetted or whether a separate publishable projection is needed; avoid duplicating independently editable sources.

## Why placeId is not universal

Kitchen may exist without Place to support online-only/test/name-only Kitchens. Business can have multiple `place_ids[]`. Supplier currently links through Business, and uses Place-backed brand presentation. Property currently requires Place. Projects and Portfolios need no Place. Standardize **relationships by real cardinality and ownership**, not by forcing `placeId?: string` on every Entity.

## Domain-specific vs shared

- Kitchen: e.g. `cuisines`, Kitchen/Place relationship, eventual kitchen-specific public metadata; Items/Menus/Services do not belong to Identity.
- Business: contacts and one-to-many Place links.
- Supplier: Business association, supplier publication and catalogue/delivery settings (capabilities, not necessarily Identity).
- Project: unique project lifecycle/guest authority (latter private and separate).
- Portfolio: owner, strategy, and region labels; private notes.
- Property: property type, unit count, publication state and Place relationship.
- Place (shared linked Entity, not itself a Workspace family here): address, location, contacts, logo, wordmark, cover, gallery, palette, business hours. When Workspace displays Place content, edit through its owner, not a duplicate copy.

## Existing shared mechanisms; avoid reinventing

- `packages/extensions/fireux-workspace/src/runtime/workspace/composables/useWorkspaceIdentity.ts`: generic identity state wrapper.
- `packages/core/fireux-core/src/runtime/composables/fireux/useIdentityEditor.ts`: draft, change tracking, guarded save, scope.
- `docs/concepts/workspace.md`: Workspace provides shared Identity/Team/Overview/Calendar experience, while domains own data and trusted commands.
- `docs/concepts/entities.md`: Workspace Entity families are independent domain Entities.

## Codex when desktop resumes

1. Compare this inventory to the latest local tree; report drift.
2. Return a concise **common vs optional vs domain-specific** matrix with authoritative owner and publication rules. Include `context` explicitly and propose how public context differs from private operational notes.
3. Propose the smallest shared `WorkspaceIdentityCore` shape and whether it is best implemented as a read interface, TypeScript composition, reusable UI contract, or combination. Avoid a universal stored `identity` blob.
4. Identify conflicts: Kitchen `imageUrl` vs Appearance/Place; nested Identity on Project/Portfolio/Property/Supplier; Supplier linked-source data; source of publication and slug authority.
5. Do not perform wholesale cross-repo migration or rewrite without a separately reviewed target + migration plan.
6. Preserve concurrent working tree and, after any approved implementation, **git save** (commit/push via normal workflow) and report SHA.
7. No live database writes, migrations or deployments as part of this audit.

**Next step remains Items, after Identity ownership has been resolved.**
