# Walking mode handoff — Native Nuxt spine and App entity ownership

Date: 2026-11-25
Status: Investigation proposed; publication is not execution approval.

## Context
Blank's independent App reads were reported saved at `9f76d8313` on `codex/kitchen-item-reference-cutover`. Reconcile that branch with current main before drawing conclusions. Pause the proposed permanent component migration.

## Agreed direction
FireUX spine = native Nuxt spine + FireUX entities. Distinguish Nuxt's application directory, the App entity, application-wide infrastructure and entity-specific functionality. Do not assume the two meanings of app require separate directories.

## Bounded investigation
- Determine whether sharing the native app directory creates actual namespace or registration conflicts.
- Compare Core's `src/runtime/app/` and existing module registration with native Nuxt layers, modules, component discovery and composable auto-imports.
- Identify what native Nuxt already provides, what FireUX genuinely extends, and whether runtime placement is required for packaging.
- Compare entity-first and native-spine-first placement, including implications for User, Ecosystem and Workspace.
- Use Blank as the reference; preserve canonical model exports, independent reads, emulator safety and existing downstream consumers.
- Consult installed Nuxt versions and official documentation where available; report evidence gaps rather than assuming behavior.

## Deliverable
Proposed sole edit path for an approved Walking Bridge run: `docs/reviews/2026-11-25-nuxt-spine-app-ownership.md`. Record current filesystem, registration requirements, alternatives, naming conflicts, migration implications and recommendation. If the relevant branch or dependencies are unavailable, report that limitation.

No implementation changes, file moves, new abstractions, entity renames, production access or deployment. Return findings for discussion before migration. Separate user approval required under Walking Bridge rules.
