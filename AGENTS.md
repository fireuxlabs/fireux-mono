# Working in FireUX Mono

Start with the [root README](README.md), then open the owning package or App
README and inspect the source and real consumers for the task. Follow applicable
local instructions and consult only the relevant sections of shared guidance.

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
  difference from that reference. Reuse the existing FireUX owners and native
  Nuxt mechanics.
- Check the actual consuming result against the FireUX pattern and the requested
  behavior. Use focused tests and type or build checks as appropriate. For UI
  changes, follow the [UI rules](docs/ai/gpt-context.md#ui-and-design-system)
  and inspect the rendered surface and affected interactions. Report the
  evidence and any important gaps before calling the work complete.
- For docs, verify claims, links and anchors. Run `git diff --check` before
  completion. Keep current explanations beside their owners.

Use [shared working guidance](docs/ai/gpt-context.md) when the task crosses
owners or needs UI, verification or coordination conventions. The
[repository map](docs/concepts/fireux-mono.md) explains package relationships.
