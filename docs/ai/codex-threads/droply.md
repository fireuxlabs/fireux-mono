# FireUX - Droply module thread (Codex)
Authority: Automation context (Codex implementation handoff)
Updated: 2026-03-14
Audience: Implementation context for Codex agents.

## Scope
- Thread key: droply.
- Audience: Codex agents implementing code and runtime changes.
- Priority: enforce Tier1 canon and preserve runtime contracts.

## Commit Window
- Start: 2026-03-09T13:13:43+01:00
- End: 2026-03-13T10:05:44+01:00
- Source: manual_refresh_2026-03-13

## Implementation Signals
- 542875481 feat: align consolable CTA family and project runtime entry (2026-03-10)
- 60a8c1ec0 feat: align project console create flow (2026-03-11)
- 95f6d18b1 refactor: delete stitch and simplify console routing (2026-03-11)
- cf4b20dd8 feat: switch fireux ecosystem to named firestore db (2026-03-12)
- 0017bb017 feat: add fireux console database discovery pipeline (2026-03-12)

## Working Guidance
- Validate against Tier1 first: docs/fireux-canon.md, docs/runtime-contract.md, docs/seo-canon.md.
- Prefer shared runtime and composable fixes before project-local divergence.
- Keep route, runtime-project, and firestore-db behavior aligned across core, ecosystems, and apps.

## Next Run Checklist
- Re-scan from the next successful timestamp.
- Rewrite this file in place, trim post-marker content, and keep one terminal marker.
- Rebuild the daily consolidated chatcontext file.

#end
