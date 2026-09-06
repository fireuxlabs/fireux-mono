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
