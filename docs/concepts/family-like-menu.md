# Like-menu operation family

Updated: 2026-07-26
Ref: c94401076
Role: map, not canon

## Purpose

Map Workspace operation browse pages whose primary job is to create and read a
collection, with record inspection, update, and deletion owned by the child
detail route.

The family name describes the Menu reference shape. It does not mean that its
members are Menu entities or inherit Menu data authority.

## Links and authority

- Parent: `workspace.md`
- Horizontal: `components.md`, `pages.md`, `collection-manager.md`
- Reference member:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Operations/Menus`
- Executable contract: `scripts/guards/like-menu-family.mjs`

Current source and the executable guard outrank this map.

## Shared jobs

An adopted member has:

1. a thin route page that owns the Workspace panel, navbar, and body;
2. a domain operation entry;
3. a visible records list;
4. a separate visible create tool;
5. records before tools;
6. a child detail route that owns inspect, update, and delete;
7. dedicated routes for large creation, review, configuration, or live
   workflows.

The records and create surfaces may remain visually unframed when their
contents are self-explanatory. Each retains a named semantic section. The
domain owns record cards, creation, child-record actions,
permissions, loading/error/empty states, and navigation.

An adopted collection must use the shared Firestore pending/error/outcome
contract. A failed read renders an unavailable state before empty copy; it must
not stay pending because collection data is absent or collapse the failure into
“no records.”

A dashboard-style member may add a bounded operation summary and place the
records workspace beside a narrower tools rail. That composition must still
preserve records before tools in source order and must derive its counts and
access state from the same domain controller rather than creating presentation
authority.

The family does not authorize a generic cross-domain collection reader or tool
registry. Data and mutation authority stay with the owning operation.

## Members

| Member | Records | Tools | Status |
| --- | --- | --- | --- |
| Kitchen Menus | Menu records | Create Menu | Reference and guarded |
| Kitchen Dishes | Dish records with quick look | Create Dish | Adopted and guarded |

Other Kitchen, Supplier, Portfolio, or Project operations are not members until
they are deliberately aligned and added to the executable registry.

## Accepted differences

- A member may have no writable tools for a read-only source, but the tools list
  must explain that state rather than exposing a write path.
- Creation method and destination route vary with the operation lifecycle.
- A live operation such as Orders may use its own command-surface family instead
  of this browse family.
- Records may be cards, rows, or a bounded table when domain density requires
  it; the records/tools separation remains visible.
- A dense card collection may open a read-only quick look before navigation,
  provided the quick look retains an explicit action to the child detail route.
- A self-explanatory records list may omit a redundant outer title,
  description, count, and card.
- A create surface may use one compact card or action without an outer wrapper.
- A dashboard-style member may use a summary card, status tiles, and an
  asymmetric records/tools grid when the operation benefits from an at-a-glance
  workspace.

## Stop signals

- A create form, QR generator, or multi-step review workflow expands directly
  in the browse entry.
- Inspect, update, or delete controls appear on the collection entry instead
  of the selected record's child route.
- Tool controls are mixed into the record list without a record-level reason.
- A shared component starts fetching domain records or deciding permissions.
- A new operation is added to the guard before its real records and tools exist.

## Refresh and verification

When the family changes:

1. inspect the Menu reference and the proposed member;
2. update the member table and accepted differences;
3. update `scripts/guards/like-menu-family.mjs`;
4. run the family guard, focused lint/type checks, and the affected Workspace
   route.

Keep temporary rollout state and speculative member lists out of this map.
