<!-- Concurrent edit — 2026-07-21 12:21 CEST — Cleanbox to Werkbox migration: record the durable Werkbox ownership boundary. -->
# Werkbox GPT Context

This is the scoped context entrypoint for work on Werkbox inside
`fireuxlabs/fireux-mono`. It inherits the root `AGENTS.md` and
`docs/ai/gpt-context.md`; read both completely before using this file.

## Purpose and scope

Werkbox is the general hub for cleaning and other non-hospitality practical
work. Cleaning is a Werkbox domain/category, not a separate ecosystem. Misebox
continues to own hospitality work.

This scope covers the Werkbox ecosystem package, Werkbox project apps, and the
way shared work domains are composed into Werkbox. It does not transfer shared
Job, Place, Company, profile, or other reusable domain authority into the
ecosystem package.

## Refresh and authority

Before each Werkbox task:

1. Read the current root `AGENTS.md` and `docs/ai/gpt-context.md` completely.
2. Inspect `packages/ecosystem/fireux-werkbox`, the relevant app under
   `projects/werkbox/*`, and the owning extension packages for any shared
   domains in scope.
3. Follow the Concept Cascade in `AGENTS.md`, starting with the smallest
   relevant maps under `docs/concepts/*`.
4. Use the nearest working sibling in the same family before proposing a
   Werkbox-specific shape. Misebox is the nearest global ecosystem/app sibling;
   tenant siblings depend on the surface being changed.
5. Run focused package or app type checks and the relevant guards after a
   change; broaden verification only when shared seams or registrations move.

Current source, executable guards, and tests are implementation truth. Concept
maps provide navigation. Deleted Cleanbox documentation, prior chat state, and
remembered implementations are not authority.

## Ownership boundaries

- `packages/ecosystem/fireux-werkbox` owns shared Werkbox identity, Firebase
  binding, configuration, and genuine cross-app ecosystem behavior.
- `projects/werkbox/*` owns app-specific composition, branding, content,
  routes, hosting configuration, and tenant presentation.
- Reusable work concepts remain in their owning extension packages. Job and
  category identifiers must stay product-neutral so a category can move to a
  different product without rewriting its underlying records.
- Cleaning is represented by a neutral category identifier such as
  `cleaning`; do not encode `cleanbox` or `werkbox` into reusable Job/category
  identity.
- Hospitality-specific composition remains under Misebox. Do not make Werkbox
  an umbrella for Kitchen/Menu behavior or move those authorities here.
- The Werkbox logical ecosystem currently uses the existing Firebase project
  `cleanbox-f15bc`, named database `cleanbox`, canonical Project/Ecosystem id
  `cleanbox`, and main App id `cleanbox-app`. These are physical or stored
  legacy authority identifiers, not current product names. Renaming, moving,
  or deleting remote resources requires an explicitly approved migration.

## Living context

Re-check this file whenever Werkbox package ownership, app boundaries, shared
work-domain authority, Firebase binding, or the relevant concept maps change.
Update it in the same repository change when those durable boundaries change;
update `docs/ai/gpt-context.md` only for repo-wide rules. Keep temporary task
state, speculative product plans, deployment status, and data-migration notes
out of this file.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
