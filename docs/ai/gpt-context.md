# FireUX GPT Context

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

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
