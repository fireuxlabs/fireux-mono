# FireUX Granite

Updated: 2026-10-05
Ref: 9b1f0851d
Role: package entrypoint, not canon

Granite composes a Portfolio Workspace for property and landlord operations.
Start with root `AGENTS.md` and `docs/ai/gpt-context.md`.

- `src/module.ts` installs the configured Portfolio domain extensions.
- `fireux-properties` owns Portfolio and Property implementation.
- `fireux-compliance`, `fireux-documents` and `fireux-tasks` contribute their
  Portfolio-scoped records, Tools and commands.
- `projects/granite/granite-app` owns the concrete App and its industry research
  at `app/search-demand.ts`.

The research uses Core's shared contract for sources, operator jobs, ranked
proposals and separate need/readiness assessments. Proposals do not change
runtime ownership, navigation or command authority. Refresh findings and source
assessments against their current inputs; Core's `src/test/app-research.test.mjs`
checks reference integrity and research rendering. Live operator acceptance is
separate. Follow `docs/concepts/family-workspace-entity.md` for runtime boundaries.

## App entrances

Granite Main App opens a public Property Directory at `/`; its App-owned Portfolio
Workspace composition lives at `/workspace/portfolio`. Discovery consumes the
Property-owned published summary reader, not full Portfolio records. Core
navigation provides the Workspace entrance and return to Directory. Tenant Apps
keep their branded customer root and existing domain-owned management authority.
