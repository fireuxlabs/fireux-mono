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

1. Prove capability exposure with the existing Kitchen-only and Items-only
   registrations. Start with the [guarded Items Delete gap](2026-11-23-kitchen-items-lifecycle.md)
   in a separate checkpoint. Keep the usage guard and verify allowed and denied
   mutations without the Menu routes. Preserve the full Misebox composition.
2. Align the shared surfaces one Entity at a time using existing features.
   Resolve whether Business needs a separate Overview and what should supply
   Calendar events before exposing new destinations. Check Calendar data in
   actual opt-in Apps before describing it as functional.
3. Follow the data and command dependencies of each Domain capability. Correct
   concrete dependencies at their owners, keeping navigation and storage paths
   stable. Treat the public Menu checkpoint as separate work.
4. Align root model filenames with the lowercase Entity naming pattern in small
   source-only slices. Start with Kitchen and handle Supplier's case-only move
   separately. Leave field and authority changes to their own review.

Verify each runtime slice against an actual consuming App, including selection,
navigation, capability availability and authorization. Keep the independent
Kitchen and Items proofs and full Misebox in the regression scope for Kitchen
changes. The first checkpoint is documentation only.
