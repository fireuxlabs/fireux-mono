# FireUX Changelog System
Authority: Tier2 (Operational history)
Updated: 2026-03-28

This is the repo-level change history and decision-history system.

Use it to record:
- what changed
- what we used to think
- what we do now
- why we changed direction
- what canon, contracts, routes, or runtime branches were affected

This is not Tier1 truth.
Tier1 canon still lives in:
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

## How This Works

The changelog mirrors the repo branch system rather than creating one log per package.

Branches:
- `core/README.md`
- `extensions/README.md`
- `ecosystems/README.md`
- `apps/README.md`
- `runtime/README.md`

Each branch changelog should record meaningful shifts, not every commit.

Good entries:
- route policy changed from one rule to another
- storage model changed
- console ownership moved
- docs system changed
- package family behavior was standardized

Bad entries:
- typo fixes
- formatting-only edits
- trivial refactors with no policy impact

## Entry Format

Use newest-first entries.

Recommended structure:

```md
## 2026-03-28 - Short title

Previous:
- what we used to do or believe

Now:
- what we do now

Why:
- why the change was made

Affected:
- canon docs
- contracts
- package/app/runtime branches
```

## Relationship To ADRs

- ADRs are for long-lived architectural decisions.
- Changelog branches are for operational and directional history.
- If a changelog entry hardens into a major repo decision, promote it into an ADR and link both ways.

## Relationship To Reports

- `docs/reports/**` are audits and snapshots.
- `docs/changelog/**` is the running history of meaningful decisions and reversals.

## Current Branch Map

- `core/README.md` = cross-cutting core platform and repo-level shifts
- `extensions/README.md` = shared extension-family changes
- `ecosystems/README.md` = ecosystem-level shifts
- `apps/README.md` = app-surface and delivery shifts
- `runtime/README.md` = runtime branch-system history and cross-surface runtime changes
