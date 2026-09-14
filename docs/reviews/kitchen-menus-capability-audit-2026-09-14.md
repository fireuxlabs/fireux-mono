# Kitchen Menus capability audit

Reviewed: 2026-09-14
Role: evidence and recommendations, not implementation authority
Scope: `/workspace/kitchen/menus`, using La Tapberne as the browse-only client.

## Verdict

The capability already has most of the machinery for a useful menu editor:
live menu selection, sections, dish references, prices, availability, appearance,
publication, source import and website ordering. Its presentation exposes too
much of that machinery. It is not yet an accepted end-to-end QR-menu experience.

The next implementation should complete La Tap's content → preview → publish →
share journey. It should reuse the existing domain readers and commands, with
specific repairs below, rather than introduce a new capability framework.

## Evidence and limits

Browser inspection covered the signed-in La Tap Menus index, Food content and
the Las Tapas section. Source inspection covered creation, publication, theme,
QR, website snippet, live reads, commands and bounded AI intent. This audit did
not change production records, submit imports, test payment, or perform a new
publish/unpublish cycle. Mobile layout, keyboard access, guest capability use,
and parity with the dedicated La Tap App still need acceptance checks.

The focused run contained 22 tests: 16 passed and six failed. The six command
tests fail because their loader does not supply `serverKitchenAccessTarget` to
the mutation-authority module. Production source imports that helper; this is
evidence of a stale test harness, not a demonstrated missing runtime import.
Those command behaviours remain unverified by this run. No full App typecheck
was run as part of this audit.

## How it works

| Stage | Current input and process | Result |
| --- | --- | --- |
| Select | Active Kitchen supplies a live parent-scoped Menu collection; choose a Menu | Focused Menu and available actions |
| Create | Name and optional description; actor membership, allowance and currency checked | New unpublished Menu |
| Import | URL or uploaded document enters a separate source/processing flow | Material to turn into a Menu; not proof that import completed |
| Structure | Add and edit sections | Ordered presentation groups |
| Content | Select an existing Kitchen dish and enter a price; edit availability | Menu item referring to the dish with Menu-specific selling information |
| Appearance | Four palette values, with Kitchen/default fallback | Menu presentation override |
| Publish | Named publication command and public directory synchronization | Public Menu address |
| Share | QR capability and website-ordering snippet are separate surfaces | Customer entry points |
| AI | Visible Menu names, selection, allowance and permitted actions | Opens ordinary controls; does not change prices or extract a document through this chat |

Kitchen remains the operational context; Menu owns its presentation and
publication. Reusing dishes should be convenient without requiring the operator
to understand that storage relationship before adding their first item.

## Findings, in priority order

### 1. Appearance contract is not fully reconciled

The separate Menu theme editor still reads Kitchen `workspace_theme.palette`.
The current Kitchen pipeline uses `theme.palette`. The earlier cleanup missed
this consumer, so its inherited preview can disagree with the public renderer.

Theme editing currently checks general write availability, not the agreed paid
editing entitlement. Its generic update path is not a named entitlement-aware
theme command. Correct both the editor and authoritative write boundary. Keep
the accepted development Rules policy separate from this application contract.

The editor also replaces its local palette from reactive source changes. Verify
that a live update cannot silently overwrite a person's unsaved colour edits.

### 2. Restore command verification before claiming acceptance

Repair the command-test loader and rerun its capacity, membership, invalid-path,
overwrite and downgrade cases. Passing rendering/AI tests cannot substitute for
these checks.

### 3. The index duplicates navigation and actions

Observed: top Food/Drinks selector and Create Menu, another Menu list with CRUD
controls, then another selected-Menu card and CRUD controls. Disabled Create,
Read, Update and Delete buttons add clutter. The same name and description recur.

Keep the agreed workspace selector and visible AI, but give each one a single
job. The selector chooses; the editor edits. Use one Add Menu action and a small
overflow menu for infrequent actions. Do not force a complex domain editor into
every control exposed by the simple Test capability.

### 4. Everyday work is too deep

The current path is Menu → Items & prices → section → item price. Each row
repeats a formatted price and a raw editable price, alongside Full dish and
expanded operational details. Adding an item requires an existing Kitchen dish.

Show section headings and compact item rows together. Make name, price and
availability immediately usable. Put description, variants and deeper dish
details in one drawer. Offer “New item” and “Use existing dish”; compose the
existing domain commands rather than introduce a second dish store. Inspect
creation atomicity and recovery before implementing that combined action.

### 5. Browse-only publication is mixed with ordering

Publishing includes website ordering, while QR sharing lives on another route.
La Tap's job is a readable menu and a stable QR destination. Give publication a
single Publish & share surface with public preview, address and QR. Link ordering
as an optional capability when relevant. Existing snippet code is useful for
Bären later, but its presence is not evidence that that client flow is ready.

### 6. Some state and boundary behaviour still needs proof

- Selection is local and falls back to the first active Menu. Test Kitchen
  switching and transient list states before accepting selection stability.
- Creation UI checks pending state but does not explicitly require a successful
  collection outcome. A failed read must not become apparent spare allowance;
  server capacity checks remain necessary.
- Archived records count towards the retained-record allowance. Explain this
  only where it blocks an action; provide a deliberate archived view.
- Several updates write directly and then synchronize publication separately,
  while creation and publication use trusted commands. Define failure/retry
  behaviour for partial success; do not report a failed synchronization as if
  the original edit never saved.
- A public-entry route is not proof that an anonymous visitor can execute its
  tools. Test the capability's actual guest path independently of Kitchen Landing.

## Proposed offer

| Behaviour | Policy |
| --- | --- |
| Food and Drinks starting menus | Existing two-menu Free allowance; display names remain editable independently of stable identity |
| Names, descriptions, sections, prices and availability | Essential menu maintenance; do not make ordinary corrections dependent on paid appearance controls |
| Publish, unpublish and public browsing | Core menu usefulness; unpublish remains available after downgrade |
| QR and shareable URL | Recommend including in the basic QR-menu offering |
| Additional custom menus | Existing paid unlimited allowance; Free counts two retained records |
| Theme editing | Agreed paid feature; current gates need implementation |
| Saved theme after downgrade | Nothing rewrites or removes it; future theme edits require the appropriate current subscription |
| Import and AI usage | Cost and allowance policy still to decide after proving the import workflow |
| Ordering, kiosk and website checkout | Separate client journeys, composed with the same menu content |

Current allowance uses the acting AppUser's subscription. Whether a paying
Kitchen should confer paid editing on every team member is a separate product
decision; do not silently change the entitlement owner during the visual pass.

## Proposed UX

```text
Kitchen selector                      Menus
Food · Drinks · …                     + Menu

Food                         Live     Preview
Content   Appearance   Publish & share

Las Tapas                            + Item
Aioli                         CHF 9.50   [on]
Bravas                        CHF 9.50   [on]
…
+ Section

Compact visible AI input / contextual help
```

This is a recommendation, not a pixel-tested design. Use Nuxt UI and the existing
workspace framing. Prefer spacing, typography and clear states to additional
nested cards. Keep one page title and concise action labels. Appearance can show
a preview alongside four simple colour controls; avoid a general theme builder.

On mobile, use a single column, reachable item actions, a compact selector and
an item drawer. On desktop, allow a preview beside the editor when useful.
Show saving, saved and failed states near the edited content. Preserve edits on
failure, offer retry, and keep confirmations for consequential actions. Icon
controls need accessible names and keyboard focus; colour controls need labels
and contrast validation.

AI should use the same commands and available actions as the UI. Its current
navigation assistance should be described honestly. Extend it only after the
manual edit journey is dependable, with review before price/content changes.

## Public discovery and SEO

The workspace serves operators. Public Kitchen/Menu pages serve customers and
search discovery. Recommend deriving public titles, descriptions and previews
from the same saved content, validating canonical destinations across Misebox
and dedicated Apps, and excluding management surfaces from indexing. Verify
current metadata, canonical URLs, publication responses and indexing directives
before calling these implemented. A live unpublish should also disappear from
an already-open public directory without refresh.

## Bounded next passes

### Now — repair the known Menu contract faults

Fix the retired Kitchen palette read, implement the agreed theme-edit command
entitlement, and repair the command-test harness. Check Free, paid and downgraded
actors; no downgrade data rewrite. This is a Menu seam, not a repo-wide sweep.

### Next — complete La Tap's QR-menu journey

Simplify the index and content editor, bring preview and QR sharing into the
publication journey, and keep ordering optional. Reuse the same domain components
from Misebox and the dedicated App. Verify:

1. Select the same Kitchen/Menu in both Apps.
2. Edit a price and availability; another open customer view updates live.
3. Add/reuse an item without losing work or creating duplicates on retry.
4. Edit a paid palette; downgrade leaves appearance unchanged but blocks edits.
5. Preview, publish, scan/open the QR and unpublish without manual refresh.
6. Switch Kitchens without stale content or actions targeting the previous one.
7. Recover from read/write/import failure with clear state and retained input.
8. Complete the flow on a narrow mobile screen and with keyboard navigation.

### Later — prove the next real consumer

Use Pizza Interlaken to prove kiosk ordering and Bären to prove embedded entry.
Extract additional shared behaviour only after those real differences are clear.

## Source entry points

All paths below are relative to `packages/extensions/fireux-kitchens/src`:

- `runtime/pages/workspace/kitchen/menus/index.vue`: route composition.
- `runtime/kitchen/composables/workspace/menus/useKitchenWorkspaceMenus.ts`: workflow.
- `runtime/kitchen/components/Workspace/Menus/`: index, creation and editing UI.
- `runtime/kitchen/components/Workspace/Menus/Edit/Theme.vue`: remaining palette drift.
- `runtime/menu/composables/useKitchenMenuCollection.ts`: live collection.
- `runtime/menu/composables/firestore/mutations/useMenuUpdate.ts`: mixed update paths.
- `runtime/menu/server/workspace-commands.ts`: trusted commands.
- `runtime/menu/utils/menu-capacity.ts`: current allowance.
- `runtime/kitchen/server/menus/intent.ts`: bounded AI navigation.
- `test/menu-workspace-commands.test.mjs`: failing command harness.

The agreed theme policy is recorded in `docs/ai/misebox-context.md`. This review
does not replace it or claim that proposed UX is already implemented.
