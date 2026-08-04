# Repository performance

Updated: 2026-08-04
Ref: d232cc731
Role: map, not canon

## Purpose

Define how FireUX measures repository feedback speed without turning one
machine's timing into a false universal budget. This map inherits `AGENTS.md`
and `docs/ai/gpt-context.md`; current commands and guards remain stronger
authority.

## Measurement seam

`pnpm measure:workspace` runs the complete shared verification family and
prints one machine-readable JSON report. `pnpm measure:workspace -- --quick`
measures the guard and package typecheck while iterating.

The report records the environment, exact commands, elapsed time, and exit
status. It does not write a tracked snapshot and does not set pass/fail timing
thresholds. A threshold becomes valid only after repeated measurements on a
named reference environment demonstrate a stable distribution.

Command correctness remains separate from speed: any non-zero command fails
the measurement run regardless of elapsed time.

## Ownership

- Root tooling owns orchestration and measurement format.
- Each command owns its own correctness and repair guidance.
- Packages and Apps own performance changes inside their existing boundaries.
- Generated build caches and local measurement output remain untracked.

## Review process

Compare like with like: the same mode, Node version, platform, architecture,
CPU class, dependency state, and warm/cold cache posture. Investigate durable
regressions at the command or package that owns them; do not hide them by
removing verification.
