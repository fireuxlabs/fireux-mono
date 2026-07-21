# FireUX GPT Context

<!-- Concurrent edit — 2026-07-21 13:07 CEST — Operation detail surfaces: record app-wide factual operation routes. -->
<!-- Concurrent edit — 2026-07-21 15:36 CEST — Shared Firestore Rules pass: route main Rules work through Core composition and ecosystem policy. -->

This is the single context entrypoint for external GPTs working with
`fireuxlabs/fireux-mono`.

## Refresh instructions

Before each task:

1. Use the current default branch of `fireuxlabs/fireux-mono`, not a cached or
   previously uploaded snapshot.
2. Read the root `AGENTS.md` completely and follow it as the operating
   instruction surface.
3. Start with `docs/concepts/fireux-mono.md`, then follow the Concept Cascade in
   `AGENTS.md` to the smallest relevant concept map.
4. Inspect the current source, nearest working sibling, and relevant
   `scripts/guards/*` files before making claims or proposing changes.

## Authority

- Current code, executable guards, and tests are implementation truth.
- `docs/concepts/*.md` files are navigation and working-context maps, not canon.
- Deleted docs, old chat-context files, old README content, cached repository
  snapshots, and remembered implementations are not authority.
- If current repository files cannot be read, say that the context could not be
  refreshed instead of presenting stale knowledge as current.

## Semantic catalogue boundaries

- `/operations` is the factual index of operations exposed inside the app's
  consoles. Every declared operation must point to a working `/console/*`
  operation route; Overview, Identity, Team, Sundries, dashboards, public
  indexes, and tools are not Operations.
- `/operations` is app-wide and groups entries by their owning Console. Prefer
  stable anchors such as `/operations#kitchen`; do not duplicate the index at
  domain routes such as `/kitchen/operations`.
- Each declared operation also receives a factual detail surface at
  `/operations/<slug>` when its owning record declares an app-wide unique
  public slug. It derives its language and working Console CTA from that same
  record; it is not a second capability source or an SEO Solution.
- `/solutions` is the authored customer and search-intent projection of proven
  capabilities. A Solution is not evidence that an operation exists.
- Tools are executable utilities and should not be used as a synonym for
  Operations or Solutions.

## Firebase MCP targeting

Firebase MCP is configured once in the user's Codex environment, not repeated
inside each FireUX app.

Before any remote Firebase operation:

1. Identify the concrete app directory under `projects/*/*` and use its
   `firebase.json` as the application deployment surface.
2. Resolve the owning ecosystem package under `packages/ecosystem/*` and read
   its `.firebaserc` for the Firebase project ID. Project apps must not own a
   competing `.firebaserc`.
3. Confirm the intended Firebase project and named database explicitly. Never
   infer the database from the app name or Firebase project alone.
4. Point the Firebase MCP environment at that app/project/database before using
   remote tools, and report the resolved target.
5. Default to read-only inspection. Deployments, data writes, migrations,
   deletes, rules changes, and other remote mutations require explicit user
   authorization and the relevant backup or verification gate.

Do not add per-app MCP configuration files merely to expose Firebase to Codex.

## Firestore Rules source ownership

- FireUX Core owns reusable main-database Rules fragments and deterministic
  composition under `packages/core/fireux-core/src/config/firebase/rules`.
- An opted-in ecosystem owns the complete template manifest and its explicit
  project/database/domain deltas under `src/config/firebase`.
- The tracked `scripts/firebase/<ecosystem>/firestore.rules` file is the locked
  complete release artifact. Check it with `pnpm firebase:rules:render`; update
  it only through the renderer's explicit `--write` mode.
- Deploy and migration commands verify, but never regenerate, that artifact.
  App `firebase.json` files do not own main Firestore Rules.

## Living context

Treat this file as a living repository document, not a frozen prompt.

- Re-check it against current code, guards, `AGENTS.md`, and concept maps when
  repository structure, authority, ownership, or working conventions change.
- Update this file in the same repository change when a stable repo-wide change
  makes any instruction here incomplete or incorrect.
- Keep it concise and durable. Do not add temporary task state, chat history,
  speculative plans, or implementation details already owned by source code.
- Preserve this file as the single external-GPT entrypoint. Link to current
  sources instead of copying large instructions into it.
- If an update is needed but the current task cannot edit the repository, state
  exactly what in this file has become stale.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
