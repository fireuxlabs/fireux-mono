# Codex task consolidation

Date: 2026-07-29
Status: completed inventory and documentation handoff
Scope: FireUX-related Codex tasks visible in the Codex app

## Purpose

Record where durable information from the accumulated Codex task pile now
lives before those tasks are archived. This review is an index, not a new
source of architecture truth.

Current source, executable guards, `AGENTS.md`, and the living
`docs/ai/*-context.md` files remain authoritative in that order.

## Consolidated task families

| Task family found in Codex                                  | Durable destination                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo, canon, entity architecture, family alignment          | `docs/ai/gpt-context.md`, `docs/concepts/spine.md`, `docs/concepts/entities.md`, and the entity guards                                                        |
| Misebox, Places, Kitchens, onboarding, media                | `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`, `docs/concepts/place-kitchen-media.md`, `docs/concepts/family-entity-collection-page.md`, and `docs/concepts/family-entity-detail.md` |
| Menu design, menu funnel, ordering, allergy acknowledgement | `docs/concepts/family-menu.md`, `docs/concepts/menu-ordering.md`, and current `fireux-kitchens` source                                                        |
| Sproochli, Interlaken Essen copy, translation memory        | `docs/concepts/translation.md`, `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`, the Sproochli copy guard, and current translation source                                        |
| Jobs and local/global Misebox hiring                        | `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`, current `fireux-jobs` source, and its focused hiring and doorway tests                                                          |
| Workspace organisation, Cards, CSS, public presentation       | `docs/concepts/workspace.md`, `docs/concepts/card-family.md`, `docs/concepts/components.md`, the public-family maps, and component/CSS guards                   |
| Demo data and Demo media                                    | `docs/concepts/demo-data.md`, `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`, the guarded media manifest, and publishing/audit scripts                                          |
| Finance and Deanos reporting                                | `docs/concepts/finance.md`, `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`, and current Kitchen Finance source                                                                  |
| Blogs, profiles, project users, app monitoring              | The matching concept maps and current bounded server projections                                                                                              |
| BuenoHost and Werkbox work                                  | `packages/ecosystem/fireux-buenohost/docs/ai/buenohost-context.md` and `packages/ecosystem/fireux-werkbox/docs/ai/werkbox-context.md` respectively                                                                                  |

## Durable decisions retained

- FireUX uses one guarded family spine with explicit accepted, migration,
  drift, or to-confirm deltas.
- Canonical entities remain root-authoritative; App-support records carry only
  access or operational deltas, and public DTOs are bounded projections.
- Place owns location facts and venue photography. Kitchen owns operational
  identity overrides and Menu behavior. Media is resolved at read time rather
  than copied across owners.
- Public directories and details reuse Core-owned semantic presentation seams
  while domain packages retain DTOs, data acquisition, routes, actions, and
  publication authority.
- Menu browse and ordering are distinct surfaces. The active Menu Order
  lifecycle owns basket, review/correction, allergy acknowledgement, submit,
  and confirmation; the older funnel tree remains migration debt.
- Sproochli translation is source-language-aware, attachment-scoped, and
  reviewable. Generated copy does not silently replace canonical source text.
- Misebox Jobs reuse the shared Agent/Company/Place-linked Jobs family.
  Tenant Apps may expose exact-source local catalogues while the main Misebox
  catalogue aggregates approved public Jobs and returns applicants through a
  configured HTTPS source doorway.
- Demo fixtures stay deterministic and package-owned. Repository manifests
  describe immutable Demo media; Firebase Storage remains binary authority.
- Workspace indexes consume authoritative target-family state and do not create
  parallel target, membership, or lifecycle authority.

## Exclusions

Unrelated personal, health, image-generation, email, calendar, and non-FireUX
ChatGPT projects were not copied into this repository. Their presence in the
Codex account does not make them FireUX documentation.

Automation run threads contain execution history rather than durable product
architecture. Their schedules and memory remain owned by the automation
system, not this repository review.

## Maintenance

Do not append future task summaries here. Update the smallest living context,
concept map, guard, or source owner when a stable contract changes. A future
cleanup may create a new dated review and link to the then-current authority.
