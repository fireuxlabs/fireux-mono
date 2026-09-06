# Kitchen and Project entry benchmark

Date: 2026-09-06
Status: accepted design checkpoint; functional prototype, not a release claim.

## What is real

- Both App-owned `/` routes open the Workspace layout without requiring sign-in or selection.
- Existing domain selectors, workspace CRUD controls, subscription presentation and capability links are composed into the page. This pass did not reimplement their commands or prove every destination complete.
- The shared `packages/core/fireux-core/src/runtime/components/Workspace/Start.vue` accepts domain copy and tools from the two App root pages.
- Suggestions fill an editable brief. Review displays that text; Keep editing returns to editing. Workflow buttons fill authored templates.
- Briefs live in Nuxt client state keyed by workspace scope. They are not database records and are not durable across reloads.
- Page JSON exposes selection, brief and draft-only execution status. The info control explains this limitation.
- Browser checks proved suggestion/review and Kitchen workflow-template interaction. Full repository guards passed; existing unrelated typecheck errors remain.

## What was imagined

- All suggestion wording, workflow descriptions and brief templates are authored examples, not AI recommendations derived from current records.
- Kitchen service preparation and menu-launch planning do not read menus, staffing, bookings, stock or profitability and do not execute compound commands.
- Project App planning and improvement briefs do not generate an App, modify source, deploy, or create a roadmap record.
- Review brief only displays the user's text. The composer model label does not mean inference was called. No model tokens or AI credits are consumed by this prototype.
- Opening a capability does not automatically carry the brief into its tools.
- Guest exploration is the intended experience; a complete guest-to-saved-workspace flow was not proved by this pass.
- These local changes have not been deployed.

## Next design pass

The user accepted this checkpoint but found it too wordy. Centre the main composer within the content area, give it substantially more space, keep one short headline and at most one short supporting line, and reduce competing descriptions. Preserve the selected workspace at the top and keep tools discoverable below and in the sidebar.

Reference: https://lovable.dev/ — its opening uses a short heading, one supporting sentence and a primary build action. Borrow the focus, not its product promises.

Then implement one useful brief-to-tool journey using existing human commands and explicit review. Reassess each advertised workflow against actual data, authority and supported commands before calling it a compound tool.

## Follow-up: simpler composer

After the checkpoint, the user requested a shallower centred composer with a simple send icon. The brief-review panel is removed; design-brief creation is parked for later. Workflow starters now only populate the composer. Until inference is wired, Send retains the text and explicitly reports that AI is not connected. The original benchmark behavior above describes the saved checkpoint, not this follow-up.

The repeated workspace label, CRUD heading and Overview shortcut were removed from the entry composition. CRUD controls remain provisional; redesign them after the tools are connected, with collection-level creation distinguished from selected-record actions.

The entry pages now append product discovery, configuration-derived plan allowances linked to pricing, and an existing resource after the workflow starters. Free receives fuller descriptions; Premium receives compact discovery/pricing; Business receives only the resource. Resources are manually selected existing pages, not a latest-blog feed. Blog selection and completed compound execution remain future work.

## Human CRUD audit

Scope: local Project and Kitchen entry controls, signed-in developer account, existing selections, and developer Free/Premium/Business presentation previews. Preview tiers do not prove server-side subscription enforcement.

Verified in the browser: Read lists existing records and opens their details; local selection changes the selected workspace; Free/Premium disable creation at the existing collection sizes and Business enables the creation form; Kitchen rejects whitespace-only shell names and enables the button for a nonempty name; Kitchen Update rejects an empty slug. No remote records were created, updated or deleted. Original Misebox/Interlaken Pizza selection and Free previews were restored.

Fixed: empty Project creation previously swallowed its validation exception; the form now labels its name input and displays a copyable error (Copy was browser-verified). Kitchen Update now checks that its captured selection is still ready/current before saving, rejects duplicate submission while pending, and exposes Copy error. Its toolbar waits for a ready selected record. Kitchen detail's Back link now returns to `/`.

Not passed: Project entry Update and Delete have no connected dialogs; Kitchen Delete has no connected dialog. Existing low-level Delete removes only a root document, whereas creation also writes relationship/support records. Root Delete must not silently become a cascade (see the mutation context). A separately named workspace-removal lifecycle needs explicit ownership before a disposable create/remove round trip can be tested cleanly. Successful creation, successful update, deletion, guest/unauthorized writes, and server-side allowance rejection are not verified by this audit. Detail page JSON and robust missing/error states also need a follow-up.

Verification: 15 existing focused selection, freemium and Project Identity tests passed, as did the full repository guard. Both App typechecks retain existing errors outside the edited files. This is a bounded audit and repair, not completion of the full CRUD acceptance gate; do not move to AI execution on the assumption that all four primitives are ready.

## Project Update follow-up

The Project entry CRUD Update action now opens the same `Workspace/Identity/Write.vue` editor as the Identity capability. It reuses the identity controller's management-access check, exact selected Project, field validation and bounded update. No second form or mutation transport was introduced. The editor accepts an external open request, reports closing to the CRUD controller, and supports reopening after cancellation. Errors are copyable. Identity page JSON publication belongs to the Identity route; reusing the controller on `/` no longer overwrites the entry page's selection/brief JSON.

## Workspace removal definition

Status: proposed implementation contract, not a shipped tool. This defines the next removal pass; no deletion endpoint or remote deletion is introduced by the Project Update follow-up.

### Separate user intentions

- **Archive workspace:** retain the workspace and its data, mark it archived, and define read-only behavior consistently across commands. Archive does not free a workspace allowance or deploy/unpublish anything implicitly. Existing status fields alone do not prove this complete behavior.
- **Leave workspace:** remove only the requesting person's access and relevant AppUser relationship. Other people and workspace data remain. An owner must transfer ownership or use permanent removal; leaving must not create an ownerless workspace.
- **Permanently remove workspace:** owner-authorized removal of the workspace and specifically reviewed, exclusively owned supporting records. This is a named lifecycle workflow, not an expanded root Delete primitive.

### Permanent-removal interaction

1. Open a server-produced preview for the exact selected id. Show workspace name, affected people, owned record counts, retained external records, and blocking dependencies. Unknown/unowned dependencies block removal.
2. Require the user to type the workspace name and confirm the enumerated consequences. AI may prepare the preview, but cannot skip this human confirmation.
3. Recheck exact owner authority, record revisions and dependencies when confirming. A changed selection or stale preview rejects without writes.
4. Execute a bounded, atomic command where all affected records share one database and fit the transaction. Broader cases remain unavailable until a resumable removal implementation and failure recovery are proved; never pretend multiple independent deletes are atomic.
5. Re-read the index, choose a remaining accessible workspace or clear a confirmed empty selection, and report completion only after relationship reconciliation succeeds. Retrying must not remove a different workspace or duplicate effects.

### Ownership and effects

| Record | Project | Kitchen |
| --- | --- | --- |
| Root | Delete the confirmed Project root | Delete the confirmed Kitchen root |
| AppUser relationships | Remove the id from every affected `projects` array and reconcile `primary_project` in the same supported scope | Remove the id from every affected `kitchens` array and reconcile `primary_kitchen` in the same supported scope |
| Primary replacement | Keep an existing valid primary; if it was removed, select a remaining accessible id deterministically; use the current empty-pair contract when none remain | Same rule, using Kitchen fields |
| Team and owned capability records | Explicitly enumerate and remove only descendants proved owned by this Project | Explicitly enumerate and remove only descendants proved owned by this Kitchen, including default food/drinks Menus where eligible |
| User accounts and App membership | Retain User/Auth and AppUser itself; remove only the workspace relationship | Same |
| Connected Apps, Ecosystems, deployments and billing | Retain; block if removal would break an active dependency until detach/transfer has its own proved command | Same principle for tenant Apps, integrations, ordering and public projections |
| Place | No implied Place effect | Retain independently meaningful/shared Places. A synthetic shell Place is removable only when exclusive ownership and absence of other references are proved and included in the preview; otherwise block or retain explicitly |
| External media and other databases | Retain and report, or block if continued correctness requires cleanup; no implicit Storage or cross-database cascade | Same |

The first implementation should support **unused shells only**: no operational records, extra members, invitations, published projections, connected Apps or external dependencies; Kitchen may contain only its untouched initialization records. This supplies a bounded create/remove test cycle before extending removal to active businesses. Eligibility must be checked from source-owned relationships, not merely a name prefix, status, creation date or assumption that a new record is empty. AppUser arrays across all referring Apps must be accounted for; an unaccounted cross-App reference blocks the initial command.

Owners: Project's current trusted command family in `projects/fireux/fireux-app/server/project/index/` (existing placement, not a new Core lifecycle); Kitchen's command family in `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/`. Core may provide already-proved confirmation/transaction mechanics but must not own an industry cascade or a generic deletion registry.

Acceptance: test stale preview, unauthorized actor, changed selection, shared/external records, extra children, last-workspace removal, primary replacement, duplicate confirmation, failure before commit, capacity freed only after successful removal, and exact retained records. Until these pass, the entry Delete buttons remain unavailable and full CRUD is not claimed complete.

## Published identity follow-up

Misebox's public product-context API now includes App-owned identity and hashes it into the revision. FireUX validates the bounded fields and HTTPS URLs. One ecosystem-owned reader supplies the configured Misebox connection to Project Identity, its editor on `/`, and Overview. Published description/image are read-only; Project name remains local. API failures and missing published identity are shown explicitly, without falling back to editable stored duplicates. Unconnected Projects retain the original manual fields. No Project documents were rewritten and no deployment was made. Existing selector/sidebar image projections still use the stored Project record; switching those compact navigation images to App-published artwork is a separate remaining presentation pass.

## Rule-based arrival copy review

The two App-owned root pages now derive their heading and prompt starters from
already-loaded selection outcomes. Project additionally recognises a ready
published App identity. Empty, pending and failed collection reads use neutral
starting copy; selection does not imply Team, menu or onboarding completion.
The page inspector exposes the small `arrival` projection and its `rules` source.
No model request, additional database query, new stored context or inferred
onboarding flag was introduced. The landing composer remains draft-only.

Focused execution checks covered empty, pending, failed and ready selections,
and ready/failed Project publication. Full `pnpm guard` and `git diff --check`
passed. This copy is a review experiment, not a new universal onboarding schema.
Future bounded chat execution and reviewed AppUser/Workspace context remain
separate work; personal preferences and shared product facts must not be merged.

## Team interaction reliability pass

Compared Kitchen and Project Team route composition, shared CRUD dialogs,
domain adapters, availability projections and AI preparation adapters. Existing
selector/allowance, introduction, AI, CRUD and tools order is retained. The
shared editor now rechecks action availability and focused member before Save
or Deactivate; removed records are rejected. Deactivation errors remain in the
dialog with a copy action and retry, and update errors also have a copy action.
Both controllers suppress CRUD availability until Team status is ready.
Kitchen now remounts its Team controls when the Kitchen changes, matching
Project's existing reset and preventing an old dialog targeting a new Kitchen.

Sixteen focused Team tests passed, including intent preparation without writes,
revoked availability, changed focus, failed deactivation and successful retry.
Full pnpm guard and git diff checks passed. No live members were changed and no
paid model request was made. Browser end-to-end CRUD, create-flow failure UX,
page-owned inspector migration and broader Team load-error surfaces remain
outside this bounded repair; this does not claim the entire capability complete.

## Landing to Team draft handoff

Both root pages expose an explicit Continue in Team action for a nonempty draft
and ready selected workspace. Core owns only the transient handoff mechanism;
App routes own the destination and Team AI adapters consume the draft without
submitting it. The value is account- and workspace-scoped, limited to 4000
characters, expires after five minutes, and is consumed once. It is not put in
URLs or persisted in a database. Landing retains its original draft.

Browser verification passed for the selected Misebox Project and Interlaken
Pizza Kitchen: choose the Team starter, continue, observe exact draft in Team
AI and unchanged workspace selection. No AI request or mutation was submitted.
Focused tests cover mismatched workspace/family, another account, expiry,
one-time consumption and input bounds. Full guard passed. Landing Team counts
and onboarding recommendations remain a separate follow-up; this is explicit
navigation, not general natural-language routing on the landing Send button.

## Interlaken Pizza ownership correction — awaiting production release

Kitchen Developer role support is implemented locally in the Kitchen authority,
role readers, Team management and linked Place identity boundaries. Domain model
ownership remains Kitchen-specific; Core has no new industry access-role enum.
Focused positive and negative tests passed for exact active Developer membership,
other-kitchen denial, inactive/mismatched member denial and Place edits.
The protected two-record preimage and plan are in
`/tmp/interlaken-pizza-team-role-preimage.json`. Intended changes: Daniel Watson
Owner to Developer (job title Developer); Tahneeq Operator to Owner. No live
records have been changed. Automatic approval review rejected the production
release because it also includes recent Team and landing work. Explicit approval
for that release is required before deployment and the subsequent migration.
The maintained App typecheck still has unrelated baseline failures; own new
implicit callback types discovered during this pass were corrected.

## Workspace role catalogues

Kitchen and Project Team now expose optional role suggestions, custom role
creation, stable-id rename and multiple-role assignment to the selected Team
member. Storage is parent-owned roles/{roleId}; assignments use member.role_ids.
Role names are organisational labels only. The People list and filter also receive catalogue labels; legacy access roles
and job_title values remain readable until a separate migration. The earlier
Owner/Developer production migration plan is superseded by the user's latest
role direction and must not be applied as written. No live membership migration
or deployment occurred.

Kitchen browser read verified the role suggestions and empty catalogue. The
command test covers create, duplicate rejection, foreign-id assignment rejection,
multiple assignment, rename preserving ids and inactive-member rejection. Full
guard passed. Maintained App typecheck retains unrelated baseline failures; new
role component callback and assignment types found in this pass were corrected.

## Role UX polish

The shared Team Roles surface now keeps member assignment compact and moves
suggestions, custom creation and rename into Manage roles. Assignment Save/Cancel
appear only for changed selections; catalogue changes preserve unsaved member
assignments. Renaming is an explicit row action rather than a page full of text
inputs. Same-scope refreshes retain the existing catalogue while loading.
Kitchen browser verification covered the compact empty surface and opening the
management dialog; no records were changed. Vue script/template compilation and
existing role/filter tests passed. Catalogue creation/assignment logic remains
covered by the focused command tests rather than live mutation during this polish.


## Kitchen Team bounded refactor

Benchmark: `811234fe5` (saved and pushed before simplification).

- Profile: `kitchen/models/team.model.ts` contains name, linked user, assigned
  role IDs and status. `utils/team-record.ts` explicitly retains existing
  persistence/access compatibility; no remote record migration was performed.
- Main and member-detail routes consume `useKitchenTeamData`; Kitchen Identity
  also consumes its existing authority result. The member listener supplies
  live rows, and the server reader supplies authorised linked-account identity.
- The page controller owns create/update/deactivate/invite entrypoints. The
  create form now consumes Core CreatePerson directly; Write forwarding is gone.
- Removed orphan Team AI/suggestion and join-request-reader chains. The join
  mutation has a separate Kitchen Detail/Join consumer and was left outside this
  Team workspace refactor. Research routes and their three footer links remain.
- Generic tool definitions/executors retain external AI/catalogue consumers and
  delegate to the same server commands. They are intentionally not merged into
  the page controller.
- Linked names are projected from account identity and rejected by Team rename
  commands. Delayed create/delete responses preserve a newer workspace/focus.
- Verification uses mocked authority and mutation tests plus local browser
  rendering. No paid AI request, invitation creation or live membership mutation
  was used as a test. Full App typecheck has unrelated baseline failures.
