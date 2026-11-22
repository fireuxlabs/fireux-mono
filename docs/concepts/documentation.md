# Documentation ownership

Updated: 2026-11-22
Ref: 0d8d59ce8
Role: map, not canon

[AGENTS.md](../../AGENTS.md) leads to the [root README](../../README.md),
then the owner README, local documentation, and source. The root is a
directory. The owner README explains that owner's responsibility and points
to real source, consumers, and checks.

## Document roles

- **Concept maps** explain shared ownership, architecture, and terminology.
- **Living context** holds durable scope-specific guidance. Use the closest
  owner, and keep shared guidance central only when it crosses owners.
- **Handoffs and reviews** hold active decisions or acceptance evidence.
  Retire superseded material after moving current decisions or open gates to
  the right owner. Git retains the history.
- **[Priorities](../roadmaps/fireux-priorities.md)** tracks present work and
  unresolved decisions. The owning App retains release authority.

Product decisions set intent. Source and executable checks establish
implemented behaviour. A fixture or local check proves its exercised scope.
If a rule looks obsolete, name the actual consumers, authority consequences,
and verification before changing it. See
[working guidance](../ai/gpt-context.md#authority-and-rule-review).

## Contributor and public docs

Contributor docs explain repository ownership and source. The
[public reference](../../packages/extensions/fireux-docs/README.md)
explains supported developer APIs and working examples. Place each explanation
with its real owner and link to it. App-owned guides explain their concrete
composition choices. Provider setup, permissions, and deploy approvals remain
with the owning guides.

## Updating a map

Use `Updated`, `Ref`, and `Role` near the title of a living context or concept;
the ref records the reviewed source baseline. Name the owner, prerequisites,
and bounded evidence for any claimed invariant. Preserve incoming links to
current contracts or repoint consumers with the change. Keep Codex Map IDs
only when their concepts still serve a purpose. Verify links, anchors,
relevant consumer checks, and `git diff --check`.
