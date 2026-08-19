---
name: fireux-handoff
description: Transfer ownership of an active FireUX task between Big Mac and Machine 2 using a guarded Git checkpoint and a concise continuation capsule. Use when the user says “handoff to Big Mac”, “handoff to Machine 2”, “receive from Big Mac”, “receive from Machine 2”, or invokes `$fireux-handoff` for a cross-machine task transfer.
---

# FireUX cross-machine handoff

Transfer one active task without treating its Codex chat as portable. Git owns
the code checkpoint; the continuation capsule carries only the reasoning that
is not recoverable from current source, guards, history, and living context.

Normalize machine names as:

- `Big Mac`: the primary workstation.
- `Machine 2`: the always-on Remote workstation.

Determine whether the request is an outbound `handoff to <machine>` or an
inbound `receive from <machine>`. Ask only when the direction or task branch
cannot be established safely.

## Outbound handoff

1. Read the root `AGENTS.md`, `docs/ai/gpt-context.md`, and every applicable
   scoped context before acting.
2. State the source machine, destination machine, task identity, current
   checkout, branch, and intended checkpoint scope.
3. Inspect the complete working tree, upstream state, and recent relevant
   history. Confirm that every pending change belongs to this task. Stop and
   report exact paths when unrelated or concurrently owned work is present.
4. Never hand off directly from a detached HEAD. Do not use `main` for
   concurrent work unless the repository's current single-branch workflow and
   task ownership make that choice explicit and safe.
5. Stabilize only the current bounded slice. Do not expand the product task
   merely to make the handoff look complete.
6. Run `pnpm guard`. Fix only failures owned by this task; otherwise report the
   blocker.
7. Save and push through `pnpm gitsave "<accurate checkpoint message>"`.
   Never bypass its upstream, hook, guard, scope, or worktree-stability gates.
8. Verify that the worktree is clean, the branch tracks `origin`, and local
   `HEAD` equals the pushed remote branch.
9. Return a continuation capsule containing:
   - task objective and acceptance criteria;
   - source and destination machines;
   - branch and full commit hash;
   - completed bounded work;
   - important decisions and rejected alternatives;
   - verification results;
   - remaining work, risks, and unresolved user decisions;
   - exact next bounded action.
10. End with: `Ownership transferred to <destination>. Do not continue editing
    this branch on <source>.`

## Inbound receive

1. Read the root `AGENTS.md`, `docs/ai/gpt-context.md`, and every applicable
   scoped context before acting.
2. Require the continuation capsule or, at minimum, the task branch and pushed
   commit. Do not guess the task from an unrelated local chat.
3. Inspect the destination working tree before fetching. Stop if it contains
   uncommitted or concurrently owned changes.
4. Fetch and check out the named task branch. Create its local tracking branch
   when necessary; otherwise update it with a fast-forward-only pull. Do not
   merge, rebase, reset, stash, or discard work merely to receive a handoff.
5. Verify that local `HEAD` matches the capsule's full commit hash and that the
   worktree is clean. Report any mismatch instead of continuing.
6. Reconcile the capsule with current source, guards, history, and living
   context. Repository authority wins over stale prose; report a contradiction
   before changing course.
7. State: `Ownership received on <destination>; <source> must remain stopped on
   this branch.` Then continue only from the capsule's next bounded action.

## Safety boundary

- One branch has one active machine owner at a time.
- A handoff is not a merge and never integrates another task's branch.
- Do not copy secrets, tokens, `.env` values, authentication codes, or Codex
  internal task data into commits or capsules.
- If push authentication is unavailable inside the Codex sandbox, stop after
  the verified local checkpoint and give the user the exact normal-Terminal
  command needed to complete only the blocked push. Verify the remote commit
  before declaring ownership transferred.
