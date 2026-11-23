# Workspace Entity alignment

## First checkpoint

Established the Data, Shared, and Domain convention in the
[Workspace map](../concepts/workspace.md#entity-integration) and its integration
guidance in the [Workspace README](../../packages/extensions/fireux-workspace/README.md#entity-integration).
This checkpoint changes those two documents and this handoff. Runtime, model
files, public Menu work and Firestore paths remain as they were.

All six use `defineWorkspace` and `useWorkspace(family)` with domain-owned
records and access. Apps already opt into the Workspace module and layer.
Preserve those entrances and existing readers and commands. Business composes
its profile and Team at the entrance. Kitchen and Property already use the
route-safe switch where their detail routes need it.

| Entity    | Shared surface status                                                                            | Domain ownership to preserve                                                                           |
| --------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Business  | Identity and Team in the entrance. No dedicated Overview or Calendar.                            | Locations, optional Bookings                                                                           |
| Kitchen   | Identity & Brand, Team, Overview, Calendar routes.                                               | Menus, Items, Services, Promotions, Prep, Stock, Suppliers, Orders, Food Safety, Reports, Settings, QR |
| Portfolio | Identity, Team, Overview, Calendar routes.                                                       | Properties, Financial Signals, optional Compliance, Documents, Tasks                                   |
| Project   | Identity, Team, Overview, Calendar routes.                                                       | Apps, Ecosystem, platform-App Ignition                                                                 |
| Property  | Identity, Team, Overview. A base Calendar screen explains that booking events need Reservations. | Optional Reservations                                                                                  |
| Supplier  | Identity, Team, Overview, Calendar routes.                                                       | Catalogue, Ingredients, Items                                                                          |

This is a source inventory. A route can exist without an event feed or a
complete lifecycle, and navigation grouping does not assign ownership.

**Verification.** 29 focused tests passed for selection, Entity projection,
Kitchen capability composition, and Codex Map. Checked document links and
anchors, Prettier, and Git whitespace. No browser or live data checks were
needed for this documentation checkpoint.

## Remaining sequence

The [Items-only lifecycle](2026-11-23-kitchen-items-lifecycle.md) closed the
guarded Delete gap in `d8f77753c`. The [six-Entity model audit](../audits/2026-11-23-workspace-entity-models.md)
maps ownership, source references and storage. The first model checkpoint
renames the Kitchen root file to `kitchen.model.ts` and updates its consumers.

**Model checkpoint verification.** The model contents are byte-identical.
154 focused Kitchen, Items, Menu and Ignition tests passed. The focused
Kitchen contracts and commerce typechecks passed, and full Misebox prepared.
The broad Kitchens typecheck returned the same 46 diagnostics before and after
the move. This verifies the naming cutover and generated registration.
Signed-in runtime evidence remains in the earlier lifecycle handoffs.

1. Move the Kitchen-owned Item model and its consumed storage metadata to
   `kitchen/models/item.model.ts` as a separate checkpoint. Verify the direct
   Items route and full Misebox consumers. Keep the `dishes` storage path.
2. Align the remaining models one owner at a time. Handle Supplier's case-only
   filename separately. Treat public Menu work and field changes as separate
   checkpoints.
3. Align the shared surfaces one Entity at a time using existing features.
   Resolve whether Business needs a separate Overview and what should supply
   Calendar events before exposing new destinations. Check Calendar data in
   actual opt-in Apps before describing it as functional.

Verify each runtime slice against an actual consuming App, including selection,
navigation, capability availability and authorization. Keep the independent
Kitchen and Items proofs and full Misebox in the regression scope for Kitchen
changes. The first checkpoint is documentation only.
