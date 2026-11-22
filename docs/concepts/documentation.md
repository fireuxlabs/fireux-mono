# Documentation system

Updated: 2026-11-22
Ref: eb57620fa
Role: map, not canon

## Purpose

Explain how FireUX documentation stays useful to humans and agents without
becoming a second, stale implementation authority.

## Authority

Use documentation to find and understand the system. Use current source,
executable guards, and tests to prove how the system behaves.

The authority order is:

1. Current source code.
2. Executable guards and tests.
3. Living context under central or owning-package `docs/ai` locations.
4. Concept and family maps under `docs/concepts`.

The source owner's README is the current explanation of that implementation.
Current source and executable evidence settle behavioural claims. Handoffs record outstanding work. Reviews preserve evidence needed for open
acceptance or release decisions.

When a map disagrees with source or a guard, follow the source or guard and
update the map in the same change when the corrected rule is durable.

## Document roles

| Document                                                                  | Job                                                             | Must not become                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| `AGENTS.md`                                                               | Short operating router                                          | The whole repository rulebook                   |
| `docs/ai/gpt-context.md`                                                  | Durable repo-wide agent context                                 | A copy of every concept map                     |
| Owning package/App `docs/ai/*-context.md`, or central cross-owner context | Durable scope-specific agent context                            | Task status, chat history, or speculative plans |
| `docs/concepts/*.md`                                                      | Navigable concept and family maps                               | An implementation substitute                    |
| `docs/roadmaps/fireux-priorities.md`                                      | One current priority queue with promotion criteria              | A competing architecture or release authority   |
| Source READMEs                                                            | The owning scope, immediate children and current implementation | A second copy of shared rules or child detail   |

Link to the immediate source owners from the parent README. Where a single
package already owns the lane's responsibility, link straight to that package.
Use central concept maps to explain relationships shared across owners.

## Metadata

Every living context and concept map should expose these fields near its title:

```text
Updated: YYYY-MM-DD
Ref: <reviewed short git ref>
Role: living context | map, not canon
```

- `Updated` is the last meaningful content review, not a formatting touch.
- `Ref` is the source baseline used during that review. It is not a changelog.
- `Ref` is a short commit that resolves in, and is an ancestor of, the current
  checkout.
- Git owns document history. Do not accumulate per-edit timestamp comments in
  the body.
- Use `Scope:` when a context applies to only one ecosystem, product, package
  family, or recurring task.

## Links

- Follow [AGENTS.md](../../AGENTS.md) through the [README spine](../../README.md)
  to the owning package or App. Consult relevant scoped guidance and concept maps.
- A concept map should name its parent, children, and closest horizontal maps.
- Prefer repository-relative paths that can be opened directly.
- Link to current source and guards instead of copying large implementation
  excerpts into prose.

## Checking documentation

Verify links and claims against current source when editing a document. The
former documentation guard was removed with `scripts/`; there is no mandatory
`pnpm guard` step or graph generator. A document's shape is not evidence that
its architectural claims are still useful.

Keep navigation useful, but do not add documents, graph edges, or boilerplate
solely to satisfy a retired check. Git retains obsolete history; current
entrypoints should describe the system that exists now.

## Reviewing the rules themselves

Consistency is not correctness. A rule repeated across living context, concept
maps, source shape, and guards may still be obsolete, over-broad, or more
expensive than the problem it prevents. The documentation system must leave
established rules open to evidence-based review rather than treating successful
enforcement as architectural proof.

For a rule review, identify the concrete problem, current source evidence, real
consumers, failure history, enforcement mechanism, and ongoing complexity cost.
Use the repository-wide result vocabulary in
`../ai/gpt-context.md#authority-and-rule-review`: keep, simplify, narrow, replace, remove, or
unproved. Preserve safety and authority boundaries until a proposed change is
accepted and independently verified.

Source is behavioral authority, not automatic evidence of architectural merit.
Do not reopen established rules during ordinary work without a concrete trigger:
contradictory source, repeated consumer workarounds, accumulating exceptions or
duplication, recurring enforcement failures, or an explicit architecture audit.
Age and inconvenience alone are not review evidence.

A recommendation to simplify, narrow, replace, or remove must state its exact
scope, evidence, affected consumers, safety and authority consequences,
transition path, and verification. This keeps rule review falsifiable and
prevents preference from being presented as architectural correction.

This assessment belongs in the smallest relevant living context or concept map
only when it is a durable conclusion. Temporary investigation notes and
speculative alternatives do not belong in living documentation.

## Contributor and public docs

| Reader                                     | Start here                                                                                                                       | What belongs there                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| People and agents working on FireUX        | [AGENTS.md](../../AGENTS.md)                                                                                                     | Working rules, scoped context and architecture maps. |
| People building with FireUX                | `/getting-started` and [the public reference](../../packages/extensions/fireux-docs/src/runtime/pages/docs/index.vue) at `/docs` | Setup, supported APIs and examples.                  |
| People and tools reading published context | `/context` and `/context/research`                                                                                               | Reviewed summaries of FireUX and its research.       |

Keep contributor guidance in the repository. FireUX App hosts the public
guides and the `fireux-docs` reference. Give each API one explanation with its
source owner. The public reference can present source-owned explanations and
working examples. Reviews and handoffs stay with the repository evidence.

Ecosystem Main Apps own shared public guides for their products and libraries.
Tenant Apps, such as La Tap Berne, and standalone Apps add documentation only
for an explicit product need. They may link to their Ecosystem's guides.
Misebox follows its scoped [Main reference and tenant-link boundary](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#developer-reference-ownership).
The App selects its documentation layer. The `fireux-docs` extension hosts
FireUX's developer reference. It depends on Core for native surfaces and on
`fireux-bookings` for its separate Extension component preview. Core depends on
neither Docs nor Bookings. The App and Ecosystem bundles do not add that
FireUX-specific content to other Apps.

The public reference follows the parts of a Nuxt App that developers work
with: configuration, app.vue, pages, layouts, components, composables, and server
routes. Each guide leads with what FireUX adds, shows an example, and links
to the relevant Nuxt or Nuxt UI reference for the basics.
The manually maintained Core public component catalogue has been removed.
The `/docs/components` route remains as a landing page, alongside existing
hand-authored examples. No replacement discovery or public-library contract
has been adopted yet.

The full source inventory is internal at `/dev/core-components`. It includes
App, User, Ecosystem and shared Core implementation components; inclusion
is not a public API promise. Its detail pages show source and existing previews.
The Docs layer excludes those routes in production and generates an empty
internal inventory there. Extension components retain their own examples, such
as the [Bookings customer form](../../packages/extensions/fireux-docs/src/runtime/pages/docs/components/bookings.vue).

The smaller `fireux-docs/src/runtime/models/catalogue.ts` supplies the curated
usage guides and sidebar links. Patterns and templates remain separate
compositions. Nuxt UI owns the reference for its basic controls.

Use the FireUX voice in section headings and keep guide titles easy to match
to their Nuxt and Nuxt UI counterparts.
Group Core component examples by the job they do. Feature controls with real
consumers and a clear shared responsibility.

## Family maps

A family map is useful only when it distinguishes the shared spine from its
deltas. Each family map should answer:

1. Which members belong to the family?
2. What must every member share?
3. Which differences are accepted, and why?
4. Which differences are migration debt or unexplained drift?
5. What should align next, and what evidence would complete that work?

Use these delta states consistently:

| State        | Meaning                                            | Required treatment                                       |
| ------------ | -------------------------------------------------- | -------------------------------------------------------- |
| `accepted`   | Product or authority difference that should remain | Explain the reason and point to source or guard evidence |
| `migration`  | Temporary compatibility difference                 | Name the desired destination and removal trigger         |
| `drift`      | Difference with no accepted reason                 | Recommend alignment; do not normalize it in prose        |
| `to-confirm` | Product decision is genuinely unresolved           | State the question and avoid implementation ceremony     |

“Different” is not an explanation. A delta without a reason is drift until it
is reviewed.

### Growth phase is not delta state

Use the controlled named-sibling lifecycle in `spine.md` when a family is
still being discovered. `baseline`, `proving sibling`, `differentiating`, and
`established` describe the maturity of a family seam. They never replace
`accepted`, `migration`, `drift`, or `to-confirm`, which classify differences
between members.

While that lifecycle is active, the smallest relevant family map records:

- the complete baseline and the bounded seam being tested;
- each real proving sibling and its owner;
- established lower-level fundamentals reused from the start;
- the intended differentiation question or brief and explicit non-goals;
- any deliberate duplicated structure; and
- the comparison evidence required before extraction or a permanent guard.

This is durable family context, not a task checklist. Remove obsolete proving
notes when the comparison graduates into a spine, and retain the resulting
invariants and classified deltas. Initial equivalence records construction
provenance only; it cannot be cited as evidence that a contract is shared.

## Roadmaps

Use [FireUX priorities](../roadmaps/fireux-priorities.md) as the single current
queue. Give each entry a bounded outcome and a finish condition. Record any
decision that still needs an owner. Keep release gates with the releasing App
and durable decisions with their source owner. Retire superseded plans once
useful current decisions and relevant evidence have an owner. Git retains the
old plans and unchecked items.

## Quality check

Before finishing a documentation change:

- Verify claims against current source, nearest siblings, and relevant guards.
- For a repo-wide ownership, filesystem, Entity, Workspace, or product-language
  change, audit every maintained living context and concept map for the old
  claim before moving source. Incoming graph links alone are not enough to
  prove that the old system has disappeared.
- For an active family-growth phase, verify the baseline, real sibling intent,
  differentiation target, and graduation evidence against current source.
- Preserve `to-confirm` where evidence is incomplete.
- Ensure every listed delta has a state and reason.
- Keep context files durable and move detailed family material into concept
  maps.
- Check local paths and metadata.
- Check the changed links and run `git diff --check`; run focused executable
  checks only when their contracts changed.

## Context ownership and public explanation

Keep global and genuinely cross-owner guides central. Put durable domain guidance
under the owning package’s `docs/ai`, ecosystem composition under its ecosystem
package, and App-specific guidance under that App. `AGENTS.md` owns shared
operating requirements, and owner READMEs lead to local guidance and source.
Create a guide only when it has a recurring responsibility.

The public context pages and APIs read authored platform and research
summaries. Command authority stays with the owning tools and server checks.
