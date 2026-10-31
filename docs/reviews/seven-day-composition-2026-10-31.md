# Seven-day composition review and Menu Express

Date: 2026-10-31
Scope: additions since 2026-10-24, surviving at `48c9cc224`, plus this pass.

## Inventory and limits

The [classified inventory](seven-day-composition-2026-10-31.json) covers 209 surviving additions and current new files, refreshed after
the shared Menu preparation migration.
It includes runtime source, tests, documentation, configuration and assets.
Deleted intermediate wrappers are excluded; Git remains their history.

Every inventory entry was classified by owner and role. Code checks cover
TypeScript/Vue syntax, relative imports, Core upward dependencies, UI/server
imports and authored utilities. JSON/JSONC was parsed. Source-reviewed families
include collection coordinators, Workspace framing/identity/calendar, mutation
targets, image adapters, Products, Ignition and Menu Express. Tests and archived
literature retain their separate roles; assets are not page compositions.
This structural audit does not certify every runtime journey or historical claim.

## Corrections

- Removed authored utilities from the new Framework and Ignition surfaces;
  native Nuxt UI, supported semantic classes and existing tokens remain.
- Removed repeated collection pagination callbacks, a redundant Kitchen Calendar
  outcome and an unused Sidebar value.
- Replaced the Ignition preview's local revision counter with Core command scope;
  obsolete input/disposal completion cannot replace current source or unlock
  a newer pending request.
- Moved Menu Express source-file behaviour from Nitro handlers to its named
  App `server/menu-express/sources.ts` owner. Routes delegate without changing URLs.
- Kept the prior preparation and same-file upload retry repairs in this queue.

## Misebox Product

Created `products/menu-express` through the existing trusted Products command.
Before creation the public detail endpoint returned 404. Afterwards it returned
an active public service Product owned by `misebox-app`, with zero prices.
No Stripe API call or payment configuration was needed.

Catalogue-only creation is now a supported input to that same command: an
explicit empty price list validates and creates atomically without a provider.
Priced creation retains its existing reservation, retry and finalization contract.
The App-owned offer supplies the catalogue seed; the customer Product page reads
the saved Product and composes the existing header with intake/self-service links.
No price, turnaround or subscription promise was invented.

## Internal Kitchen use

The new `menus/prepare` Workspace route composes existing Kitchen creation,
saved-source, review, Menu publication and QR owners. It requires ordinary
Kitchen access and respects existing capacity/processing policy. It requires no
Product purchase, service request or demo payment.

Misebox transfers the supplied source automatically into the same Menus command
and binds the request to its source/Menu identity. Both surfaces compose the same
preparation reader and controls; manual linking and file transfer are removed. That request retains customer
contact, external approval and delivery tracking. Kitchen self-service retains
its own team review and publication authority. No parallel Menu processor,
publication writer or request schema was introduced.

A browser check opened the actual Product page and the selected Bären Kitchen's
internal entrance. Its existing saved source opened in the current review UI.
That check revealed and repaired duplicate local breadcrumbs and loss of the
applied Menu destination after reload. No operational Menu was changed or
reprocessed; the existing source's saved applied slug now supplies its link.

## Release boundary

Stripe remains parked. No deployment, Rules/IAM change, charge, new provider
price or operational venue change was made. Actual paid checkout remains a
separate unfinished proof. Product and Workspace tabs are left open for inspection.

## Verification

Ninety-one focused tests passed across Products, Menu Express, collection-page
composition, protected images, Menu source/process/review, Ignition and IDE
ownership. Misebox App/server and FireUX App typechecks passed; changed-source
lint, formatting and `git diff --check` passed. The internal purchase-free
composition and persisted applied-Menu link have explicit regression tests.
Browser evidence covers the actual Product, current Kitchen entrance and saved
source continuation. A fresh internal AI extraction/publication was not run in
this pass; no new AI/provider spend is claimed. Changes remain uncommitted.

## Composition follow-up — 31 October

The structural inventory is not repository-wide composition acceptance. A wider
static screen inspected 1,752 Vue files and found 784 files with obvious authored
utility-class candidates (static class attributes containing flex/grid, selected
spacing utilities, text-sm or w-full). This is a lower-bound candidate inventory,
not semantic review of every component; archived/diagnostic surfaces and live
product paths need separate classification. No automatic mass rewrite was made.

The Menu Express intake had its recovery/submission lifecycle embedded in the
form component. `useMenuExpressIntake` now owns draft recovery, retained request
identity and submission; Intake composes its controls over that owner. Existing
interrupted-response and stale-context tests now execute the composable directly.
The eight client lifecycle tests passed; focused lint and diff checks passed.

The component Page documentation still used AppHero, nonoptional pagination and
the retired missing outcome, and described inline platform SEO options. Examples
now follow the actual separate Apps routes and usePlatformAppsPage owner.

Composition remains the priority before functionality expansion. Review active
chains in order: Menu Express + native Menus, shared Workspace/Identity, entity
collection pages, then Ignition. For each, inspect the route, named parent, state
owner, supported lower readers/commands and immediate consumers. Fix duplicate
reads/authority, misplaced workflow and unsupported presentation at their real
owners; do not manufacture wrappers or split files by length. Wider libraries
remain unaccepted until their actual consumers receive the same review.

### Menus/Express ownership pass

Removed the processor’s implicit Workspace fallback and its type dependency on
the Workspace record context. The processor now takes an explicit read-only
context and lives with Kitchen’s Menu capabilities. Workspace source detail
passes its existing context; service preparation retains its one source read.
No new reader, provider, Product registry or compatibility adapter was added.
The focused reader tests were still coupling source acquisition to the retired
aggregate; their fixtures now compose the real separate source owner and render
shared preparation states. All 35 selected process/upload/composition/reader
tests and Misebox App typing passed. The inspected processing controls now use native controls, existing semantic
layout/typography and small domain presentation rules instead of authored
utilities. This does not certify the rest of Kitchen’s older editor surfaces.

Read-only browser verification reopened the saved shared source: both test items,
applied-draft feedback and the existing Menu destination rendered successfully.
No source was reprocessed, published or otherwise mutated in this pass.

### Older Menu editor composition

Inspected the record root and its Settings, document, source, publication,
readiness and lifecycle consumers. Metadata and hours state now have named
Workspace record owners receiving narrow explicit context. The visible controls
remain in their components; neither new owner fetches data. Archive/restore/delete
reuse the root’s existing command instances. Deletion navigation stays in that
root; the confirmation child no longer dispatches a parallel delete or redirects
a second time. Management authority retains the old lifecycle panel’s boundary,
separate from daily-content subscription gating.

The touched record framing, hours, document and removal surfaces use semantic
classes; Settings no longer adds a second fixed page-width constraint. Ninety-two
focused editor, reader, publication, input, hours and processing tests passed.
New regressions cover retained management authority and delayed hours edits
after target change/disposal. No feature, provider, payment or live-data mutation
was added. This does not certify every older Items/Sections descendant’s style
implementation or every Menu format’s browser journey.

The final App typecheck, changed-source lint and diff check passed. A read-only
browser check opened the existing labelled demo’s content and Settings views: metadata,
audience, serving-hour summary and lifecycle controls rendered. No write,
archive, deletion, publication or provider operation was performed.

### Items and Sections alignment

Inspected all Items, Sections and Edit components and their shared Section/record
owners. Removed the lower Section capability’s Workspace type import in favour
of its explicit input contract. Daily previews now consume one catalogue source
from the Sections editor rather than opening one per row. Their per-section
placement reader remains local. New-Dish creation/placement has a focused state
owner using the existing Dish and Section commands; the form remains visible.
Removal now follows the same shared write gate as other Section mutations.

Removed authored utility classes and inline row styling in the inspected Items
and Sections controls. Shared editor arrangements live in one domain stylesheet;
native USelect replaces hand-styled native selects. The calendar retains semantic
selected/present-day indicators and its bounded seven-column geometry.

Corrected tests still pointing at the retired Workspace Section owner. Mutation
adapter fixtures exercise account scope; selected Kitchen/route scope belongs to
the editor caller and is covered by the editor lifecycle checks. No adapters were
added to production to satisfy those stale fixtures. Eighty-nine selected tests passed after the removal-gate recheck. Stripe and
deployment remain parked. No live record changes were required.

Browser verification opened the real labelled demo’s Section editor, all three
Add-items tabs and the Sections collection, without submitting changes. It caught
and corrected an empty-value USelect item: native placeholders now represent the
unselected state. Computed-style and visual inspection confirmed that the shared
editor stylesheet is loaded by both editing parents. No module-wide alternate
style registration or server restart was needed. Daily calendar target/selection
logic has fixture evidence; no additional daily Menu was created for this pass.

## Combined Menus and Menu Express checkpoint

Reviewed the native Menus collection/create/source/process/edit/publication/QR
compositions together with all Menu Express intake, request, operator and
delivery components and adapters. The service remains above Menus: one automatic
source transfer and target binding, shared preparation, owning Menu commands,
revision-bound customer approval and delivery. No manual linking or parallel
processing implementation was reintroduced.

The remaining creation, audience, publication, source-view and QR Workspace
styles now consume native controls, semantic styles and supported tokens. Remaining
state-card callers use FireState; QR preserves idle/pending/error honestly and
exposes the owning read errors. Modal width/accessibility styling is semantic,
not a per-instance utility recipe. Shared style loading follows the actual
composition roots. Static inspection covers 59 native Menu components and 14
Menu Express components, including bound classes and UI overrides. This is the
connected native/service workflow boundary, not a claim that every public Menu
ordering/fulfilment descendant in the package has received a presentation rewrite.

All 382 combined Menu/Menu Express tests passed. Seven initially failing tests
were stale fixtures (refresh callback, newly composed projection dependencies,
and retired portal setup); they now exercise the current source owners. Another
45 tests passed for the pending Core, Products and Ignition queue. Misebox
App/server typing passed; the final checkpoint also checks formatting and lint.
Earlier live demo delivery remains the end-to-end evidence; this reconciliation
does not create another request, process source data, charge or publish. Stripe
remains parked and there is no deployment or live permission change.

Final read-only browser checks loaded the native Prepare-a-Menu entrance and its
saved sources. The service route correctly displayed recovery when no customer
proof was present; the operator entry also loaded. No proof was bypassed and no
new delivery was claimed. The final checkpoint saves the inspected shared queue,
including the earlier Core/Products/Ignition composition repairs.
