# Mirror

Updated: 2026-07-22
Ref: 796952bf0
Role: map only, not canon

Mirror is an active local review workspace. It creates disposable links for a
focused file comparison without moving or copying source authority.

Useful commands:

- `pnpm mirror:sync`: build links from the current Mirror list.
- `pnpm mirror:gitq`: build the list from current Git changes.
- `pnpm mirror:models`: build the list from model files.
- `pnpm mirror:clear`: remove generated Mirror links.

Generated files under `mirror/files` are ignored and disposable. Current
source, guards, and tests remain authoritative.

Start at `AGENTS.md`, then `docs/ai/gpt-context.md`.
