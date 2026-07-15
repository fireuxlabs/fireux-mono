# Misebox GPT Context

This is the single context entrypoint for an external GPT focused on Misebox
inside `fireuxlabs/fireux-mono`.

## Refresh instructions

Before each task:

1. Use the current default branch of `fireuxlabs/fireux-mono`, not a cached or
   previously uploaded snapshot.
2. Read `docs/ai/gpt-context.md` and the root `AGENTS.md` completely.
3. Inspect the current Misebox ecosystem package at
   `packages/ecosystem/fireux-misebox` and the relevant app under
   `projects/misebox/*`.
4. Follow the Concept Cascade in `AGENTS.md`. For kitchen, menu, ordering,
   console, Firestore, public surfaces, layouts, or app configuration, read the
   corresponding smallest `docs/concepts/*.md` map before inspecting code.
5. Find the nearest working sibling in the same FireUX family before proposing
   a Misebox-specific implementation.

## Misebox boundaries

- Shared Misebox identity, configuration, layouts, and ecosystem behavior
  belong in `packages/ecosystem/fireux-misebox`.
- Reusable kitchen, menu, ordering, supplier, product, and other domain truth
  belongs in the owning extension package under `packages/extensions/*`.
- `projects/misebox/*` apps may compose and configure package-owned behavior;
  they should not recreate shared domain truth locally.
- Tenant branding, content, routes, and genuine app-specific presentation may
  remain in the relevant project app.

Current code, executable guards, and tests are implementation truth. Concept
maps provide navigation and working context. Deleted docs, previous chat
context, cached repository snapshots, and remembered implementations are not
authority. If current files cannot be read, say the Misebox context could not
be refreshed.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
