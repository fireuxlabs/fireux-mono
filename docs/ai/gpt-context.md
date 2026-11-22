# Shared FireUX working guidance

Updated: 2026-11-22
Ref: eb57620fa
Role: living context
Scope: repository-wide

[AGENTS.md](../../AGENTS.md) holds the operating requirements. Follow the
[README spine](../../README.md) to the owner and consult the sections below
when their subject applies.

## Ownership and composition

Use the [repository map](../concepts/fireux-mono.md) for dependency direction,
the [runtime map](../concepts/runtime-filesystem.md) for placement, and
[Lasagne](../concepts/lasagne.md) for composition. Keep the path from read to
screen to action direct. Remove unnecessary work before extracting a helper,
and share a responsibility only when its actual consumers justify the boundary.

### Mandatory composition checks

Apply the start and finish checks in [AGENTS.md](../../AGENTS.md).
At the start, identify the existing composition, lower owners being reused
and the specific domain or App difference. At completion, follow the actual
route, registration or route-to-command path as relevant. Preserve access,
readiness, cleanup and stale-completion behavior. Report fit against the
reference as well as functional results. A screenshot or successful build
covers only the behavior it exercised.

## UI and design system

Use Nuxt UI, shared styles and semantic tokens. Authored Tailwind utilities
require explicit approval for the exact adjustment, including utilities in
templates, generated strings, `ui` overrides, styles and `@apply`. Nuxt UI may
use Tailwind internally. Existing utility use grants no further exception.

Follow the [component convention](../../packages/core/fireux-core/src/runtime/components/README.md#vue-file-convention)
and [layout admission rules](../../packages/core/fireux-core/src/runtime/layouts/README.md#layout-admission). Review UI
changes in the actual consumer at the affected viewport sizes and exercise the
changed interactions.

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
- For cross-owner work, make the responsible owner and real consumers clear.
  Name bounded Codex chats for the manifest and outcome when coordination is
  requested. [Codex Map](../../tools/ide/README.md#repository-and-codex-map)
  derives the inventory from current source.

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
