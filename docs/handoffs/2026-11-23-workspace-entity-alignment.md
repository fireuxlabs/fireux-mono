# Workspace Entity alignment

## Kitchen Identity & brand

The Workspace Identity editor now saves flat fields through the existing
protected Kitchen update command. A name-only Kitchen can open the editor.
The scoped reader exposes root fields and optional Place without requiring
legacy nested Identity. Both slug layouts are checked in the shared namespace.
This checkpoint leaves the public directory rendering and relationships outside
the editor with their existing owners.

The emulator-backed Workspace saved and reloaded a name, slug and description.
The running named-emulator endpoint also verified unauthenticated and
ungranted write denials, duplicate slugs, renaming with a stable slug, and Place
linking and unlinking. The real Misebox route returned HTTP 200. Firefox
automation did not expose its signed-in form.

## Minimal Kitchen and Items

The current [Kitchen model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts)
requires `id`, `name` and `items` and declares optional slots for the Misebox
sidebar. Existing capability types are reused where the owner and shape are
clear. The optional slots introduce no new readers or storage. Name-only
creation writes `name` at
`kitchens/{kitchenId}`. The document path supplies the ID. The Misebox
Workspace selects granted Kitchen records directly and uses legacy names or
an optional Place name for records without a root name.
The existing App membership and Kitchen grant transaction still controls
creation, retry and access. The Items page loads `kitchen.items` from
`kitchens/{kitchenId}/items` and uses the existing protected CRUD commands.
The Item type is unchanged. The restricted Rules candidate allows
grant-scoped Item reads and keeps writes server-only.

The initial reset verified ID-only creation and reopen, plus Item create, list, detail, update,
and delete in the local named emulator. An unrelated App member received
`403`. A saved Menu reference still blocked deletion with `409`. Browser
sign-in, Kitchen creation, Item creation, editing and reopen passed. Browser
Delete confirmation was inconclusive. 102 focused tests, 29 Rules tests,
and a scoped strict TypeScript check passed.

The Misebox route was then verified in a local browser with its actual
Workspace components against the named emulator. A legacy Place-named Kitchen
and a name-only Kitchen loaded and could be switched. Item create, edit,
reload and delete passed. A second App member could not open the editor and
received 403 for Kitchen and Item reads, PATCH, and DELETE. The normal
Misebox dev server served the route, but its signed-in content could not be
inspected in Firefox. No writes were sent to that server.

La Tap Bern's 35 Items were copied from `dishes` to `items` in the named
Misebox database after a managed backup. Readback matched every copied ID and
field, and all 35 reviewed Menu references resolved to those IDs. The original
`dishes` records were retained. Signed-in Firefox navigation reached the Items
URL, but the tool could not inspect the rendered Items list.

Full Kitchen identity and publication, Place-backed surfaces, themes, Menus
and selling, Services,
Orders, and Tables still contain consumers of the old fields or path. The
full package and commerce typechecks flag that boundary. These capabilities
are outside the reset. The Rules source was tested locally and remains
undeployed.

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

**Item model checkpoint.** Moved the byte-identical [Item model](../../packages/extensions/fireux-kitchens/src/runtime/kitchen/models/item.model.ts)
and `ItemStorage` together. Reader, command, Menu presentation, test and doc
references now resolve there. `ItemOffer` remains separate. Neither Kitchen
nor Item imports the other, and the `kitchens/{kitchenId}/dishes/{dishId}`
path is unchanged.

Kitchen Core created, read and renamed a Kitchen with Item routes absent.
Items-only create, list, update, fresh read and delete passed in the named
emulator. A foreign App member received `403`. An existing Menu placement
blocked deletion with `409` while Menu routes were unregistered. The owner
could delete after the test placement was removed. Full Misebox prepared,
retained the Item and Menu handlers, and returned `200` on the local home and
Items routes. This was an HTTP smoke check, with no signed-in browser replay.
204 focused tests and both focused typechecks passed. The broad Kitchens
typecheck reproduced the same 46 diagnostics byte-for-byte.

1. Align the remaining models one owner at a time. Handle Supplier's case-only
   filename separately. Treat public Menu work and field changes as separate
   checkpoints.
2. Align the shared surfaces one Entity at a time using existing features.
   Resolve whether Business needs a separate Overview and what should supply
   Calendar events before exposing new destinations. Check Calendar data in
   actual opt-in Apps before describing it as functional.

Verify each runtime slice against an actual consuming App, including selection,
navigation, capability availability and authorization. Keep the independent
Kitchen and Items proofs and full Misebox in the regression scope for Kitchen
changes. The first checkpoint is documentation only.
