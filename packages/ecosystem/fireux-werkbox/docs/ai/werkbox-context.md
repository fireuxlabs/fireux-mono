# Werkbox GPT Context

Updated: 2026-09-11
Ref: 53fa40ee6
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
5. Run focused package or App typechecks and relevant source-owned tests after a
   change; broaden verification only when shared seams or registrations move.

Current source and executable tests are implementation truth. Concept
maps provide navigation. Deleted Cleanbox documentation, prior chat state, and
remembered implementations are not authority.

## Ownership boundaries

- `packages/ecosystem/fireux-werkbox` owns shared Werkbox identity, Firebase
  binding, configuration, and genuine cross-app ecosystem behavior.
- `projects/werkbox/*` owns app-specific composition, branding, content,
  routes, hosting configuration, and tenant presentation.
- Both Werkbox Apps declare native Nuxt layers in their App configuration.
  The ecosystem layer extends Core; each App declares only its enabled domain
  layers. Modules retain domain options and route filtering. The global App
  includes Job, Place, and Company layers; the tenant does not.
  Core's native runtime assertion checks public resolved-layer membership and
  rejects missing config-time declarations; no private insertion fallback remains. Generated discovery and Jobs
  capability filtering are covered by `runtime-layer.test.mjs`; layer presence
  alone does not imply a capability is enabled.
- The main Werkbox App follows the shared Main App product-landing spine while
  retaining its own truthful content and photography. Start at
  `projects/werkbox/werkbox-app/app/components/Landing`, and verify the
  composition against Core landing components and the nearest Main App sibling;
  visually check the affected routes. The product-landing guard is removed.
  Do not restore a project-local landing framework or move Werkbox artwork
  into Core.
- Werkbox hero photography consumes Core `FireLandingProductHeroImage`; Werkbox
  owns its reviewed asset, alternative text, and focal position but does not
  duplicate the shared sharp image frame.
- Werkbox follows the shared ecosystem pricing literature: Free is a functional
  Work Workspace, Pro is CHF 20/month self-managed, Managed is CHF 50/month with
  bounded FireUX assistance, and Your App is CHF 600 setup followed by Pro or
  Managed. Werkbox owns work-specific capabilities and limits; Core owns the
  common commercial meanings and amounts.
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
- Werkbox Workspace surfaces consume the shared Workspace–Entity family proved
  by the Project and Kitchen siblings. Work-domain packages retain their Entity
  data and actions; Werkbox Apps compose them and must not introduce a parallel
  Workspace selection, Team, landing, or Test system.
- The canonical logical Ecosystem id is `werkbox`. The ongoing migration still
  uses the existing Firebase project `cleanbox-f15bc`, named database
  `cleanbox`, stored Ecosystem id `cleanbox`, canonical Project id `werkbox`,
  and main App id `cleanbox-app`. Those physical and stored legacy identifiers
  must change only through the explicitly approved migration. Project Apps inherit
  that physical database binding from `fireux-werkbox`; they do not repeat it
  as an App-level `databaseId` override. Renaming, moving, or deleting remote
  resources requires an explicitly approved migration.
- Operational tooling resolves the identity database from that Firebase
  binding. The logical key `werkbox` is not a database ID; both current App and
  identity records use the existing named database `cleanbox`.
- Werkbox's current development Rules deliberately permit public CRUD. Existing
  package server APIs retain their checks, but direct Firestore access is not
  restricted by them. This is not a shipping policy.
- Werkbox owns its development Rules target manifest at
  `packages/ecosystem/fireux-werkbox/src/config/firebase/firestore.template.rules`
  and selects the shared Core open-development fragment. Adjacent domain Rules
  fragments are retained inactive policy, not current access protection. Follow
  `docs/ai/firestore-mutations-context.md` for backup, exact-target deployment
  verification, the unavailable rendering/release tooling, and the
  required shipping-policy replacement.

## Living context

Re-check this file whenever Werkbox package ownership, app boundaries, shared
work-domain authority, Firebase binding, or the relevant concept maps change.
Update it in the same repository change when those durable boundaries change;
update `docs/ai/gpt-context.md` only for repo-wide rules. Keep temporary task
state, speculative product plans, deployment status, and data-migration notes
out of this file.

When discussing canon, spine, alignment, family, or drift, state what must
match, what may differ, the nearest working sibling, and the affected files.
