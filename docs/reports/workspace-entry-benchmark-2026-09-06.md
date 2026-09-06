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
