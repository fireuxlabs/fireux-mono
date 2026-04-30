# FireUX GPT Context

Authority: User-maintained GPT working context
Updated: 2026-04-29
Audience: ChatGPT / Codex / coding agents

## Purpose

This file captures user-specific working rules, shorthand, and active FireUX direction that may not exist in repo docs yet.

It should be kept small, current, and practical.

Generated chatcontext is for repo/project state.
This file is for how Deano wants the AI to work.

## Repo identity

Primary GitHub repo:

fireuxlabs/fireux-mono

When ChatGPT has GitHub connector access, use this repo first for FireUX questions.

Do not default to Deano's personal repositories when looking for FireUX.
Search/select the `fireuxlabs` organisation repo.

GitHub connector limits:
- sees pushed repo state
- may not see uncommitted local Codex changes
- for local work, Deano should paste Git Q / git diff / changed files

## User shorthand

### `$`

When Deano sends only:

$

or uses `$` at the start of a message, it means:

Read the repo / current code context before answering.

For Codex:
- inspect the relevant files
- do not guess from memory
- prefer current repo truth
- keep response concise
- avoid reading the whole repo unless needed

For ChatGPT with GitHub connector access:
- use `fireuxlabs/fireux-mono`
- inspect pushed repo state before answering
- do not pretend pushed GitHub state includes uncommitted local changes

For ChatGPT without repo access:
- ask for current code/context or use available uploaded/context files
- do not pretend to have repo state

## Working style

- Be token-sparing when Deano is coordinating with Codex.
- Replies are often meant to be pasted to Codex, not explained back to Deano.
- Prefer direct instructions, patches, or compact architecture decisions.
- Do not over-plan.
- Do not ask unnecessary confirmation.
- Simplicity beats over-engineering.
- FireUX should move forward in small safe steps.

## Code delivery preference

When giving code:
- provide copy-pasteable continuous blocks
- do not scatter tiny fragments unless necessary
- if changing one file, prefer one complete replacement block or one clear patch block
- do not omit code between two required edits

## FireUX current mental model

FireUX has a generic console architecture:

- layout = dumb shell
- core runtime = generic console state
- domain runtime = adapter for kitchen / supplier / portfolio / project
- domain pages should stay thin
- shared core fixes are preferred over local divergence

Console runtime should not become domain-specific.

## Docs and context model

fireux-docs is the durable source layer.

chatcontext is a generated handoff bundle.

Correct flow:

Code changes
→ update fireux-docs
→ generate chatcontext
→ paste/share with GPT

Do not treat generated chatcontext as canon.

## Active priority

Current FireUX focus:

1. Finish console architecture
2. Stabilise demo/read-only/live data flows
3. Prepare Kitchen / Granite demos
4. Then push SEO/meta/public app metadata work

## Codex instruction

When this file changes, update it in place.

Keep it:
- short
- current
- practical
- free of stale project history

Always preserve terminal marker.

#end
