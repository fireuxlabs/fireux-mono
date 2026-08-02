# Werkbox GPT Context

Updated: 2026-08-02
Ref: 796952bf0
Role: living context
Scope: Werkbox ecosystem and Apps

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
3. Use the context router in `AGENTS.md`, starting with the smallest relevant
   maps under `docs/concepts/*`.
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
- The main Werkbox App follows the shared Main App product-landing spine while
  retaining its own truthful content and photography. Start at
  `projects/werkbox/werkbox-app/app/components/Werkbox/Landing`, and verify the
  composition through `scripts/guards/product-landing.mjs`; do not restore a
  project-local landing framework or move Werkbox artwork into Core.
- Reusable work concepts remain in their owning extension packages. Job and
  category identifiers must stay product-neutral so a category can move to a
  different product without rewriting its underlying records.
- Cleaning is represented by a neutral category identifier such as
  `cleaning`; do not encode `cleanbox` or `werkbox` into reusable Job/category
  identity.
- The main Werkbox App enables the shared Job package's explicit all-category
  scope. Cleaning remains a first-class landing category, not the boundary of
  the Werkbox Job catalogue or a wildcard stored as Job identity.
- Werkbox and Misebox use the same Agent-owned Job root, canonical Company and
  Place references, trusted authoring boundary, exact validation, and bounded
  public projection. Category and presentation copy are the only accepted App
  deltas; Werkbox has no separate Place-mode Job model.
- Hospitality-specific composition remains under Misebox. Do not make Werkbox
  an umbrella for Kitchen/Menu behavior or move those authorities here.
- The Werkbox logical ecosystem currently uses the existing Firebase project
  `cleanbox-f15bc`, named database `cleanbox`, canonical Project/Ecosystem id
  `cleanbox`, and main App id `cleanbox-app`. These are physical or stored
  legacy authority identifiers, not current product names. Renaming, moving,
  or deleting remote resources requires an explicitly approved migration.
- Werkbox client Firestore authority is deliberately narrow: owners may read
  and edit only the allowlisted scalar portions of their canonical User,
  UserPrivate, Agent, and Professional records; App membership/admin reads are
  scoped to the current App. Jobs, Places, Companies, public identities, App
  people hydration, and structured Professional experience use bounded trusted
  package server APIs rather than raw browser collection access.
- Werkbox owns its strict client Rules manifest at
  `packages/ecosystem/fireux-werkbox/src/config/firebase/firestore.template.rules`
  and its named policy fragments in the adjacent `rules/` directory;
  shared byte-identical policy primitives come from FireUX Core. The complete
  locked candidate and temporary deny-all cutover source live under
  `scripts/firebase/werkbox`. The guarded root commands own deterministic
  rendering checks, compilation, adversarial tests, simulation staging,
  production quarantine, and promotion.
  The one-time data executor creates its release marker only after protected
  backup, exact writes, full known-descendant inventory verification, and live
  build-bound API attestations from both Werkbox Apps.
- `packages/ecosystem/fireux-werkbox` owns the shared deployed
  `/api/internal/werkbox/security-contract` attestation. It identifies the
  runtime App and binds both deployed Apps to the reviewed server/model/config
  source manifest used by the Rules promotion gate.

## Living context

Re-check this file whenever Werkbox package ownership, app boundaries, shared
work-domain authority, Firebase binding, or the relevant concept maps change.
Update it in the same repository change when those durable boundaries change;
update `docs/ai/gpt-context.md` only for repo-wide rules. Keep temporary task
state, speculative product plans, deployment status, and data-migration notes
out of this file.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
