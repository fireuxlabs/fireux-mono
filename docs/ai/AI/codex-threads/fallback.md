# Fallback Policy
Authority: Automation context (Codex implementation handoff)
Updated: 2026-03-09
Audience: Implementation context for coding agents and maintainers.

## Scope
- Thread key: fallback.
- Audience: Codex agents implementing code and runtime changes.
- Priority: enforce Tier1 canon and preserve runtime contracts.

## Commit Window
- Start: 2026-03-07T06:57:01Z
- End: 2026-03-08T14:46:19Z
- Source: memory_last_successful_run

## Implementation Signals
- 5eef0225 chore: save shared auth fixes and thread updates (2026-03-07)

## Working Guidance
- Validate against Tier1 first: docs/fireux-canon.md, docs/runtime-contract.md, docs/seo-canon.md.
- Prefer shared runtime/composable fixes before project-local divergence.
- Keep extension contract behavior stable when touching route, runtime, or plugin paths.

## Next Run Checklist
- Re-scan from the next successful timestamp.
- Rewrite this file in-place, trim post-marker content, and keep one terminal marker.
- Rebuild the daily consolidated chatcontext file.

#end
