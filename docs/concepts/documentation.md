# Documentation system

Updated: 2026-09-11
Ref: 53fa40ee6
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
3. Living context under central or owning-package `docs/ai` locations routed by `AGENTS.md`.
4. Concept and family maps under `docs/concepts`.
5. README placeholders and historical text are not authority.

When a map disagrees with source or a guard, follow the source or guard and
update the map in the same change when the corrected rule is durable.

## Document roles

| Document                 | Job                                               | Must not become                                 |
| ------------------------ | ------------------------------------------------- | ----------------------------------------------- |
| `AGENTS.md`              | Short operating router                            | The whole repository rulebook                   |
| `docs/ai/gpt-context.md` | Durable repo-wide agent context                   | A copy of every concept map                     |
| Owning package/App `docs/ai/*-context.md`, or central cross-owner context | Durable scope-specific agent context              | Task status, chat history, or speculative plans |
| `docs/concepts/*.md`     | Navigable concept and family maps                 | An implementation substitute                    |
| README files             | Package landing map or concise placeholder | Architectural authority                         |

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

- Start at `AGENTS.md`, then `docs/ai/gpt-context.md`.
- Follow the smallest relevant scoped context and concept map.
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
`../ai/gpt-context.md#rule-review`: keep, simplify, narrow, replace, remove, or
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

## Viewer

`fireux-docs` renders `AGENTS.md`, living contexts, and concept maps from their
current repository locations. The host App owns the Nuxt Content source
collection; the package owns reusable `/docs` routes. Rendered content and the
docs manifest are views over this graph, never copied documentation authority.
Each content source keeps the narrowest watch root that contains its files; a
single root document must never make the App watch the whole repository.

The FireUX host installs this docs surface in production. Ordinary local
Workspace development leaves Nuxt Content off; set
`FIREUX_DOCS_ENABLED=true` when the local task is specifically working on or
verifying `/docs`.

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

Roadmaps are bounded recommendations, not promises. Use this order:

- `Now`: protect or clarify behavior already proved by source.
- `Next`: remove known drift or migration debt.
- `Later`: product decisions that need evidence before implementation.

Each item should name the family seam it changes. Avoid dates unless there is a
real external deadline.

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
package, and genuinely App-specific guidance under that App. Root `AGENTS.md`
remains the sole scope router. Do not create folders or guides without a recurring
owned responsibility; mixed-owner guides stay central until a single owner is proved.

The docs viewer retains its explicit central and five ecosystem source directories,
with narrow watch roots. Moving an internal guide does not turn it into a public
product contract. Existing `/docs` rendering remains separate from the curated
`readPlatformContext` public projection and FireUX `/context` page/API. The latter
never reads internal guides, live records, credentials or chat history and does
not automatically inject context into AI requests. Consumers explicitly choose
relevant context; command authority stays with the actual tools and server checks.
