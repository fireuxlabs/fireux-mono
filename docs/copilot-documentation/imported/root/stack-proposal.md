<!--
source: stack-proposal.md (repo root)
imported: 2025-12-08
note: moved from repo root during doc cleanup
-->

# Stack Normalization Proposal

## Goals

- Give every Firestore domain (User, App, Agent, Professional, Chef, Supplier, Job, future Location/Task) the same mental model.
- Reduce folder sprawl while keeping IO, business logic, and UI helpers logically separated.
- Document the delta between shared behavior and domain-specific quirks so STABLE_README duplication is unnecessary.

## Proposed Layout

```
packages/.../composables/firestore/{core|profiles}/X/
├─ useX.ts            # single public entry point
├─ README.md          # optional "diff" notes vs. the base stack
├─ data/
│  ├─ fetch.ts        # useXFetch, useXCollection, hydration wiring
│  ├─ ensure.ts       # core/app ensure helpers
│  └─ mutations.ts    # low-level core/app writers (replaces scattered mutations/*)
├─ actions/
│  ├─ update.ts       # useXUpdate, orchestrates data/mutations
│  ├─ delete.ts       # useXDelete or other destructive flows
│  └─ create.ts       # optional creator/quick-create helpers
├─ state/
│  ├─ computed.ts     # derived flags (isInitialized, hasOverlay, etc.)
│  └─ interface.ts    # pill/cell/profile builders used by UI
└─ internal/
   ├─ ensureHelpers.ts
   └─ forms/
      └─ formatting.ts  # sanitizers/validators specific to the domain
```

### Why these four packs?

- **data/** keeps all Firestore reads and writes together so it is obvious what touches the DB. It collapses the old `main/`, `core/`, `app/`, and `mutations/` folders into a single surface.
- **actions/** exposes business workflows (update, delete, create) that can be safely imported by pages or orchestrators. Actions only call into `data/*`.
- **state/** remains UI-focused and can be consumed by components or `useX.ts`.
- **internal/** hosts helpers that should never leak outside the domain.

## Root Responsibilities

| File        | Purpose                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useX.ts`   | Public facade that wires `data/fetch`, `actions/update`, and `state/*` together. Pages import this and nothing else.                                                                      |
| `README.md` | Optional, only documents differences from the canonical App stack (e.g., "Agent overlays tenant data" or "Job has editor-only helpers"). If no difference, omit the file to reduce noise. |

## Migration Plan

1. **Author Base README (App stack).** Document the canonical rules once inside the App domain. Other domains either omit README or link back with a bullet list of deviations.
2. **Refactor User/App folders first.**
   - Move current `main/*` fetchers into `data/fetch.ts`.
   - Relocate ensure helpers to `data/ensure.ts`.
   - Merge `useCoreXUpdate`/`useAppXUpdate` into `data/mutations.ts` and update imports.
   - Create `actions/update.ts` that wraps the mutations surface. Repeat for delete/create where applicable.
3. **Repeat for profile domains (Agent, Professional, Chef, Supplier).** These stacks already share 80% of their files, so it becomes mostly moving modules and updating import paths.
4. **Bring Jobs onto the same layout.** Current `main/` modules map cleanly to `data/` and `actions/`.
5. **Scaffold future domains (Location, Task) with empty packs.** This preserves the pattern even if implementations are postponed.
6. **Update all `useX.ts` facades** to reference the new locations and re-export the public API (fetch, collection, update, delete, computed, interface) from a single place.
7. **Clean up legacy paths.** Remove unused folders (`core/`, `mutations/`, `utils/`) once the imports are updated.

## Open Questions

1. **Do we want per-domain README diffs or a single table in `/copilot-documentation/`?** The proposal assumes optional lightweight readmes inside each stack plus a central reference.
2. **Should `actions/*` export individual composables (e.g., `useAgentUpdate`) or a single object (e.g., `agentActions`)?** Current code favors composables; we can keep that convention.
3. **How do we version these moves for downstream packages?** We will need a short migration note in `copilot-documentation/temporary-reports/` once the new layout lands.

## Next Steps

1. Review and confirm the folder bundle strategy.
2. If accepted, schedule the User/App refactor as the pilot change.
3. After pilot validation, create a tracking issue for migrating every remaining domain with checkboxes (Agent, Professional, Chef, Supplier, Job, Location, Task).
