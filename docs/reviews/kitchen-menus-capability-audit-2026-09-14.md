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

The agreed theme policy is recorded in `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`. This review
does not replace it or claim that proposed UX is already implemented.

## Phase One — entry and navigation consistency

Prepared after browser checks on 2026-09-15. Implementation baseline:
`aa71a303b`. The working tree was clean before this preparation.

Scope: La Tap's customer and manager entrances across Misebox and its dedicated
App. Preserve the existing Menu data, commands and shared editor. Do not expand
into imports, checkout, theme entitlements or a new navigation framework.

1. Keep public Kitchen offerings in customer-appropriate navigation. The Menus
   directory is already customer-focused; following its La Tap link must not
   restore Operations, Apps and Companies navigation.
2. Give the dedicated App a deliberate manager entry at `/workspace`, retaining
   `/` for customers. Inspect existing route ownership and authentication return
   handling before changing redirects. Misebox continues to enter at `/`.
3. Resolve La Tap's browse-only presentation through the existing ordering
   configuration/availability owner. Do not hide ordering globally or hard-code
   a La Tap exception in shared components. Audit the exact stored target before
   any data change.
4. Repair departure-time stream errors at their lifecycle owner if reproduced:
   intentional navigation cancellation must not briefly render a failed read.
   Genuine read failures must remain visible.
5. Give an unselected guest workspace a meaningful heading and next action;
   avoid displaying unusable AI controls as though they are ready.

Acceptance: follow directory → offering → menu → back; open a direct menu and
QR URL signed out; enter each App's manager surface; sign in and return to the
intended surface; select La Tap and return from an editor without losing context.
Check dashboard and workspace QR entry, mobile navigation, and reduced motion.
Do not call the phase complete until the dedicated signed-in manager path is
verified. A QR page rendering is not proof of a physical scan or production URL.

Browser evidence: Misebox Landing, Menus index, Content, Publishing, public Menu,
public directory, Kitchen detail, and public QR rendered. A private window could
read the public Food menu and QR without sign-in. Dedicated App Landing revealed
the same Food content; `/workspace` returned to Landing and `/workspace/kitchen`
led to `/auth`. The dedicated signed-in flow was not tested. Pre-order remained
visible in both customer experiences. No Menu records were changed.

First Phase One implementation: Menu directory and Kitchen offering routes now
compose `menu/components/CustomerShell.vue` with no default site layout. Browser
verification in a private window confirmed that the La Tap offering exposes
Browse menus / Food & drinks navigation and its existing menu links, without
Operations, Apps, Companies or the admin-team footer. The public Kitchen detail
page and ordering availability are outside this first bounded change.

## Dedicated workspace entrance pass

Reconciled the new task worktree from `61105afdf` to `c310f9375` on
`codex/misebox-workspace-entrance`. Copied the three tracked customer-navigation
changes and untracked `CustomerShell.vue` from `codex/project-identity-editor`;
the original checkout remains untouched.

Core's entry resolver now sends tenant Workspace actions to the first enabled
family. `/workspace` uses that same destination on server and client; global
and standalone entry actions retain `/`. The protected Workspace middleware
passes its full destination to Auth. Auth retains a validated internal return
through existing User setup, with Dashboard as the default and external/auth-loop
destinations rejected. No Kitchen command or access grant changed.

Verification in this worktree:

- La Tap `nuxi prepare` passed.
- Twelve focused entry/auth, Landing-state and transition tests passed.
- HTTP `/workspace` returned 302 to `/workspace/kitchen` on port 3108.
- Browser guest navigation reached `/auth?redirect=/workspace/kitchen` and
  displayed La Tap sign-in. `/` displayed the dedicated customer landing.
- La Tap `nuxi typecheck` failed with 130 diagnostics, including Nuxt UI required
  prop errors in Auth/EmailPanel and ErrorPage and the AppUsers subscription
  type mismatch. This is not a clean typecheck claim. Full output is in the
  task-local `/tmp/misebox-entrance-typecheck.log`.
- The old guard suite is absent from this checkpoint; no guard pass is claimed.

The original dev server on 3008 remains unchanged; 3108 serves this worktree.
Signed-in tenant return, Kitchen selection and return from editing still need
browser verification. The remaining Phase One items above are not completed
by this bounded navigation repair. No Menu data, prices, publication, Rules or
subscription configuration changed.

### Kitchen manager return links

The follow-up inspection found hard-coded `/` management links in the shared
EntitySwitcher and Kitchen Dashboard selection, Overview, Menus recovery,
Orders recovery, detail back-link and creation return/cancel controls. Kitchen
now supplies its explicit family to the existing Core entry resolver. The
shared switcher accepts that destination; other domain consumers retain their
existing default. Public Menu close remains a customer exit.

Browser verification on 3108 followed Orders → Choose Kitchen → Auth with
`redirect=/workspace/kitchen`, without visiting the customer landing. Thirteen
focused tests pass, including a tenant whose first workspace is Supplier and
whose requested return is Kitchen. La Tap typecheck still reports the same
130 diagnostics as the preceding pass (zero added diagnostics after ignoring
line-number shifts). Authenticated selection and editor round-trip verification
remain outstanding; this change does not prove those flows end to end.

### Signed-in La Tap browser test

The in-app browser completed Continue with Google from the dedicated test App's
Auth page. The existing account appeared as Daniel Watson in the sidebar.
Authentication returned directly to `/workspace/kitchen` on port 3108, and
reloading retained the signed-in manager route.

The journey then failed at Kitchen selection: after loading settled, the selector
contained no Kitchen. The page showed “Make room for your Kitchen” and “Kitchen
creation is not enabled in this app.” Reload reproduced the same settled state.
Consequently, opening a La Tap Menu editor and verifying selection on return were
blocked, not passed. No Menu data or access grants were changed for this test.

Current source scopes Kitchen associations to the current App membership via
`useKitchenAccess` and `useMembershipAccess`; a working Misebox association does
not by itself prove an association in the dedicated La Tap App. The exact stored
membership/access state was not audited in this browser-only test. The next
bounded investigation is that dedicated-App access/association path and its empty
state, before further editor-flow claims.

### Dedicated entrance UX

The dedicated Kitchen entry now uses App identity and compact framing. Its ready
state retains the selector, Landing AI and collection/focus surface, with compact
Menus, Team and Overview links. Its settled empty association uses the named
signed-in account and an explicit Kitchen-access explanation with account
switching and customer-site actions. It no longer advertises creation, renders
unusable AI or presents generic discovery cards in that state. Main Misebox
Landing remains on its existing composition.

Browser inspection as Daniel Watson on port 3108 confirmed the access recovery
state and absence of the misleading setup prompts. The ready state remains
unverified against a real dedicated-App Kitchen association. Thirteen existing
focused navigation/state tests pass; La Tap typecheck retains 130 diagnostics,
with zero added diagnostics compared with the prior pass. No access records or
Menu data were changed.

### Existing Kitchen connection and completed Menu round trip

Used the existing trusted onboarding review/completion flow as Daniel Watson in
La Tap Berne. The reviewed target was existing Kitchen
`ChIJ08WSgYSjj0cRD6oE3RwUFk0` (La Tapberne), in the configured Misebox runtime.
The review preserved existing venue details and publication; Add to My Kitchens
completed and the live workspace automatically selected La Tapberne. This was an
App-membership Kitchen connection through the existing command, not a copied
Kitchen, raw database grant or change to Menu prices/publication. That command
also ensures its existing Team roster invariant; no separate Team edit was made.

The first Drinks → Items & prices → Menus round trip reset to Food. The owner
used a component-local ref and reconciled before a settled collection. Menus now
uses shared App/User/Kitchen-scoped selection and a bounded last-selection cookie,
reconciling only ready/empty live results. Restarted only the task server on 3108
to load the changed controller after worktree path-case/HMR trouble.

Browser result after restart: La Tap remained active; Drinks remained selected
when returning through the editor's Menus breadcrumb and after a full reload.
No editor values were changed. The dedicated sign-in, Kitchen selection, Menu
editor entrance, return and reload journey has now been observed for this account.
Other accounts, tenant Apps and capability editors are outside this proof.

### La Tap browse-only configuration and public preview

Audited `misebox-78f9c` / `misebox`, exact record
`kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/food`. Food was published with
Pre-order explicitly enabled; the public doorway reflected that configuration.
Saved a protected local preimage before using the existing Workspace ordering
switch to disable Pre-order. Food now reports Browse only. The only changed
root fields are `ordering` and `updated`; publication is unchanged and effective
service hours are semantically identical. No item or price editor was used.
The existing switch removes the order-type configuration; its previous values
remain in the task-local preimage at `/tmp/la-tap-food-before-ordering.json`.

The manager's public preview incorrectly used a global Kitchen-directory route
in the dedicated App and returned 404. Profile and Publishing now use the
existing Menu route helper with the current App scope. Browser verification on
3108 opened `/food` successfully with no Pre-order action. Misebox's La Tap
Menus directory on 3001 also showed only View menu. No tenant-specific UI
exception or global ordering suppression was added.

La Tap typecheck retains the same 130 diagnostics, with zero new diagnostics
after normalizing line numbers. `git diff --check` passes.

### Product correction before checkpoint

The user clarified that La Tap should offer Pre-order alongside ordinary browsing.
Disabling it was an incorrect interpretation of browse-only presentation, not the
accepted final product state. The live Food setting remains off at this checkpoint;
its exact previous ordering configuration is preserved in the local preimage above.
The next ordering implementation must restore the intended service. The discussed
Kitchen-level mode policy and multi-Menu request are proposed work, not implemented
behavior or current architecture.

Reviewed the Kitchen collection button: it already uses Nuxt UI UButton, and its
existing width/alignment utilities are local layout constraints. CustomerShell is
shared customer navigation/framing for the two Menu directory routes, built with
UContainer and App branding; it owns no Customer data or ordering configuration.
Thirteen focused workspace/auth tests and git diff whitespace validation pass.
