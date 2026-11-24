# FireUX task guidance

Updated: 2026-11-22
Ref: eb57620fa
Role: living context
Scope: repository-wide

[AGENTS.md](../../AGENTS.md) holds the operating requirements. Follow the
[README spine](../../README.md) to the owner and consult the sections below
when their subject applies.

## UI implementation references

Follow the [component convention](../../packages/core/fireux-core/src/runtime/components/README.md#vue-file-convention)
and [layout admission rules](../../packages/core/fireux-core/src/runtime/layouts/README.md#layout-admission).

## Data and mutations

Identity, membership, subscription and resource access are separate facts.
Public projections omit protected data. Named server commands verify the
actor and exact target independently of client Firestore Security Rules.
Use the [mutation context](firestore-mutations-context.md) and the owning App's
release policy for Firestore work. Open development Rules apply only to their
approved scope. Stored data, authored Rules and deployed Rules require separate
evidence. Check deployed policy through authorized readback.

## Working and verification rules

- Use the [IDE workflow](../../tools/ide/README.md) for source-owned tests and
  generated tasks. Match verification to the change and its risk.
- For an authorized routine save, check the branch and shared changes, run
  `pnpm gitsave`, then verify the commit and synchronization. Use the
  [Walking Bridge guide](../../tools/walking-bridge/README.md) for its separate
  controller and worker rules.

## Coordination and handoffs

Reconcile active handoff decisions and checkpoints with current source.

The main Codex chat leads implementation. It tracks decisions with the user,
delegates bounded work when specialist input helps, and owns integration,
verification and the final report. For cross-owner work, identify the responsible
owner and affected consumers. Ask for authority, verification or documentation
input when the scope calls for it. Use the [Codex Map](../../tools/ide/README.md#repository-and-codex-map)
to find pinned specialist chats. Executable subagents are separate from those chats.

After a meaningful checkpoint, update the relevant handoff or add a short one
if the work needs a shared record. Include what changed, what was verified,
what remains open and the next bounded action. Link the checkpoint when its
commit is available. Include the handoff in the authorized GitHub save when
the work is ready for review. For cross-machine ownership transfers, use the
[FireUX handoff skill](../../.agents/skills/fireux-handoff/SKILL.md).

## Evidence claims

Name the verified scope. A typecheck proves compilation, an executable check
proves its exercised behavior, and a local result needs separate evidence for
live deployment. Reserve family or repository alignment claims for a comparison
across all maintained members in that scope.

## Authority and rule review

Human decisions set product intent. Current source and executable checks show
implemented behavior. Review a rule when source, consumers or verification
expose a concrete conflict. Before weakening an authority or safety boundary,
account for the affected consumers, consequences, transition and verification.

## Living-context maintenance

Update the owning context when a durable rule changes. Keep task status in
handoffs or reviews, and put current implementation explanations beside their
source. The [documentation map](../concepts/documentation.md) explains document
roles and maintenance.
