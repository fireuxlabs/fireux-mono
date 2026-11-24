# Working in FireUX Mono

Start with the [root README](README.md), then open the owning package or App
README and inspect the source and real consumers for the task. Follow applicable
local instructions and consult only relevant task guidance and active
[handoffs](docs/handoffs/).

## Architecture and UI

- FireUX extends Nuxt and Firebase. Start with native functionality and use
  Nuxt UI presentation defaults. Use shared semantic styles and tokens.
- Let requirements drive architecture. Every abstraction must own a real
  responsibility or solve a demonstrated gap. Existing usage shows migration
  scope and does not establish architectural necessity.
- During approved internal architectural replacement, update consumers directly.
  Avoid compatibility adapters unless needed to preserve an explicitly
  supported external or persisted contract.
- Get explicit approval for each exact authored Tailwind adjustment, including
  utilities in templates, generated strings, `ui` overrides, styles and
  `@apply`. Existing utility use and Nuxt UI internals grant no exception.

## Protect the workspace

- Check Git status before editing. Work on shared `main` and preserve concurrent
  edits. Create a branch or worktree only when the user requests one.
- Get explicit authorization before staging, committing, pushing, deploying,
  changing live data or performing destructive operations. `pnpm gitsave`
  stages the shared tree and pushes `origin/main`. Use it only on request.
- Before changing Firestore writes, storage scope or Rules, read the applicable
  [mutation and release boundaries](docs/ai/firestore-mutations-context.md).
  Live operations require authority for the exact target. A migration requires
  a reviewed plan, retained preimages, verification and separate authority for
  copy and retirement. An audit grants no authority to change live resources.

## Prove the change

- Before implementation or structural edits, inspect the owner, real consumers
  and nearest working reference. State the intended scope and any deliberate
  difference from that reference. Prefer native Nuxt and Firebase mechanics.
  Reuse existing FireUX owners where their responsibilities satisfy the requirement.
- Check the actual consuming result against the FireUX pattern and the requested
  behavior. Preserve access, readiness, cleanup and stale-result safeguards.
  Use focused tests and type or build checks as appropriate. Inspect
  UI changes in the actual consumer at affected viewport sizes and exercise
  changed interactions. Report evidence and gaps before calling work complete.
- For docs, verify claims, links and anchors. Run `git diff --check` before
  completion. Keep current explanations beside their owners.

Use [shared working guidance](docs/ai/gpt-context.md) when the task crosses
owners or needs UI, verification or coordination conventions. The
[repository map](docs/concepts/fireux-mono.md) explains package relationships.
