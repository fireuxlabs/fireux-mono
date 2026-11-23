# Walking mode handoff — Workspace Identity & Brand boundaries

Date: 2026-11-23
Project: FireUX / Misebox
Status: **For Codex after returning to desktop**
Priority: **Before Items**
Scope: Workspace-wide architecture audit, then Kitchen Identity cleanup
Source: saved repo docs and current Kitchen source; no live Firebase changes made

## Decisions

1. FireUX Workspace's Identity & Brand experience is **shared across Workspace Entity families** (Kitchen, Business, Supplier, Project, Portfolio, Property). **Do not implement a second central "Workspace Entity" identity record or a universal persisted `identity` blob.**
2. Shared Workspace code owns the **experience** (selection, layout, navigation, reusable field/form primitives). **Each domain Entity owns its canonical identity properties, validation, authorisation, persistence, and public projection.**
3. An Entity's public surfaces may consume its data without owning or duplicating it. A simple directory projection and a richer detail projection may differ.
4. **Target contracts first. No permanent legacy-shape compatibility, fallback, or dual-write architecture.** Historical Firestore data will be migrated via a separate reviewed migration, not in this handoff. No destructive writes or deployment.
5. **Capability boundaries:** Identity commands must not manage Items, Menus, Services, Tables or Orders. An Entity can expose flat capability slots in the application type without embedding children on its root Firestore document.
6. Work sequence: review cross-Workspace Identity convention → clean Kitchen Identity → Items → Menus → Services → Public Kitchen.

## Repo canon that supports this

- `docs/concepts/workspace.md`: shared Workspace experience includes Identity, Team, Overview and Calendar. Identity edits the Entity's **own facts**. Workspace owns shared selection, navigation and frame; domains own Entity records/capabilities/commands.
- `docs/concepts/entities.md`: Workspace Entities include Business, Project, Kitchen, Supplier, Portfolio and Property. They are domain Entities, not instances of a second Workspace Entity model. Public and Workspace surfaces consume domain owners via distinct access policies.
- `packages/extensions/fireux-kitchens/README.md`: the Kitchen canonical model/record ownership and intended technical role directories are already documented.

## Focused Kitchen audit findings confirmed against GitHub

- `kitchen/models/kitchen.model.ts`: canonical flat `Kitchen` has root `id`, `name`, `slug`, `status`, `visibility`, `description`, `imageUrl`, `placeId`; capabilities are optional slots, not proof of physical storage.
- `kitchen/utils/read-kitchen-document.ts`: still falls back to `stored.identity.name`; `resolveKitchenPlaceId` still uses same-ID Place when `placeId` is absent.
- `kitchen/server/identity/update-input.ts`: still accepts legacy `identity.name`, `identity.slug`, `identity.status`, `identity.visibility` and non-Identity `services.title`, `services.item_images`, `tables.count`.
- `kitchen/server/identity/update.ts`: slug checks both `slug` and `identity.slug`, special-cases `identity.name`; keep transactional uniqueness/access safeguards while replacing legacy shapes.
- `kitchen/types/public.ts`: the flat `PublicKitchenSummary` coexists with `KitchenPublicSummary` containing nested Identity, Services display settings, and a required Place.
- `kitchen/server/identity/read.ts` and `kitchen/utils/normalize-kitchen.ts`: current public paths depend on same-ID Place and `identity.slug`, despite the flat target's optional explicit Place relationship.
- `kitchen/utils/kitchen-presentation.ts`: public presentation still takes naming, image, logo, wordmark from Place and `services.item_images` from Kitchen Services. Decide authoritative owner and projection; don't silently duplicate.
- `kitchen/models/item.model.ts`: Item's independent identity shape is `id`, `name`, optional description/image/stamps; Items live at `kitchens/{kitchenId}/items/{dishId}`. Current Item ownership is not the reason for this Identity cleanup.

## Codex task on return

**Audit shared pattern first, not a global code rewrite.** Inspect current Identity surfaces in all Workspace Entity packages and identify:
- What can be reused as Workspace UI mechanics.
- Which facts each Entity owns and edits.
- Which "Brand" aspects are domain-managed versus presented publicly.
- Whether any cross-owner writes or duplicate stored names/slugs/images/settings are present.
- What common conventions should be adopted versus what must remain domain-specific.

Then implement **focused Kitchen Identity boundary cleanup**, preserving authorized update flows, slug uniqueness, explicit publication gating, and a functioning name-only Kitchen. Remove legacy-root fallbacks and non-Identity writes from Identity boundaries **only when the consuming paths have been updated to the agreed target contracts**. Record any dependency requiring a separate capability migration rather than relocating or dropping it blindly.

For `imageUrl` versus Appearance/Place imagery, **flag the single-source-of-truth choice for review**; do not decide by guessing. Keep Place responsible for actual venue/location facts; linking to Place is optional, not same-ID by assumption.

Before any migration: inventory stored fields and consumers, define exact target, capture backups, stage and verify migration separately. No production writes/migrations/deployments as part of this handoff. Preserve concurrent local Codex edits.

## Verification / deliverables

- Short matrix: Entity family, authoritative identity source, editable fields, shared UI, public readers and any leaks.
- Kitchen boundary fixes with file-level summary and focused tests; compare TypeScript diagnostics to existing baseline (23 legacy diagnostics reported at prior checkpoint).
- Do **not** move ahead to Items until the Kitchen Identity boundary is understood.
- Commit and push completed source changes via the normal Git save workflow after Codex finishes, and return the commit SHA; don't overwrite newer work.

This handoff is a **design/implementation brief**, not confirmation that source changes or data migration have occurred.
