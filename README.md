# FireUX Mono

Start with the [three priorities](docs/roadmaps/fireux-priorities.md).
Use **Audit FireUX progress** as the active implementation chat; finish one
bounded change there before opening another workstream.

- [Working rules and scope router](AGENTS.md)
- [Repository ownership map](docs/concepts/fireux-mono.md)
- [Parked plans and historical audits](docs/archive/2026-10-workspace-cleanup/README.md)
- [Chat archive and recovery index](docs/reviews/codex-workspace-cleanup-2026-10-25.md)

## Folder guide

| Folder | Purpose |
| --- | --- |
| `packages/` | Core, reusable domains and ecosystem composition |
| `projects/` | Concrete Apps and the project template |
| `tools/` | Local development and explicit operational tools |
| `docs/ai/`, `docs/concepts/` | Current working guidance and source maps |
| `docs/roadmaps/` | One current priority list |
| `docs/archive/` | Parked ideas, superseded plans and dated evidence |
| `temp/`, `artifacts/`, `mirror/`, `output/` | Local scratch, backups, comparison output and generated proofs; not a task queue |

Run `pnpm launcher` for the App picker. Package manifests own available commands;
read the relevant package before running checks or releases.
