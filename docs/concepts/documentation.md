# Documentation system

Updated: 2026-08-04
Ref: d232cc731
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
3. Living context under `docs/ai`.
4. Concept and family maps under `docs/concepts`.
5. README placeholders and historical text are not authority.

When a map disagrees with source or a guard, follow the source or guard and
update the map in the same change when the corrected rule is durable.

## Document roles

| Document                 | Job                                               | Must not become                                 |
| ------------------------ | ------------------------------------------------- | ----------------------------------------------- |
| `AGENTS.md`              | Short operating router                            | The whole repository rulebook                   |
| `docs/ai/gpt-context.md` | Durable repo-wide agent context                   | A copy of every concept map                     |
| `docs/ai/*-context.md`   | Durable scope-specific agent context              | Task status, chat history, or speculative plans |
| `docs/concepts/*.md`     | Navigable concept and family maps                 | An implementation substitute                    |
| README files             | Guard-required placeholder or package landing map | Architectural authority                         |

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

## Guarded documentation shape

`scripts/guards/documentation.mjs`, registered by `pnpm guard`, protects the
mechanical documentation contract without treating prose as implementation
authority. It verifies:

- exact `Updated`, `Ref`, and `Role` metadata for every living context and
  concept map, plus one non-empty `Scope` for each living context;
- resolvable reviewed Git refs;
- explicit local Markdown links, concept links, and repository-root path
  references;
- removal of retired `Concurrent edit` timestamp comments; and
- a reachable concept graph. `fireux-mono.md`, `documentation.md`, and
  `spine.md` are graph roots; every other concept map must have an incoming
  reference from `AGENTS.md`, a living context, or another concept map.

The guard validates shape and reachability only. It does not infer whether a
claim is true, require cosmetic sections, or turn a mention into canon.

## Viewer

`fireux-docs` renders `AGENTS.md`, living contexts, and concept maps from their
current repository locations. The host App owns the Nuxt Content source
collection; the package owns reusable `/docs` routes. Rendered content and the
docs manifest are views over this graph, never copied documentation authority.

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
- Preserve `to-confirm` where evidence is incomplete.
- Ensure every listed delta has a state and reason.
- Keep context files durable and move detailed family material into concept
  maps.
- Check local paths and metadata.
- Run the documentation guard through `pnpm guard`, then `git diff --check`;
  run broader focused checks when executable contracts changed.

## Documentation roadmap

### Now

- Keep `AGENTS.md` short and use this map as the documentation contract.
- Keep the documentation guard structural and its concept graph reachable.
- Keep family maps on the shared spine/delta/roadmap vocabulary as source
  changes.
- Keep the entity matrix and guard-backed families clearly distinguished from
  descriptive examples.

### Next

- Add graph edges when a durable family map is introduced; do not weaken the
  orphan check or create a broad exclusion list.
- Split overgrown maps only when a stable sub-family has its own owner and
  source boundary.

### Later

- Add viewer affordances only when they can continue consuming the guarded
  graph without copying or reclassifying its source documents.
