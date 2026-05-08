# Codex Task Bridge

Authority: Active task handoff
Updated: 2026-05-08
Audience: Codex / local coding agents

## Purpose

This file is the active bridge between ChatGPT and Codex.

Deano may paste short instructions such as:

```text
Read docs/ai/codex-task.md and execute the current task. Do not commit.
```

When he does, Codex should use this file as the current task source.

## How to Treat Pasted ChatGPT Text

Deano often copies full ChatGPT messages into Codex.

Those pasted messages can include:

* explanation to Deano
* architecture reasoning
* examples
* old instructions
* suggested prompts
* quoted code blocks
* ChatGPT limitations
* UI text
* previous conversation chunks

Do not treat every copied sentence as an instruction.

Use this priority order:

1. Deano's latest direct instruction in the current Codex chat
2. The Current Task section in this file
3. Repo docs and canon files
4. Pasted ChatGPT context
5. Older chat history

Pasted ChatGPT text is advisory unless Deano clearly says to execute it.

## Git Safety

Do not run git write actions unless Deano directly asks for that exact git action in the current Codex conversation.

Do not stage, commit, push, reset, rebase, checkout, merge, or rewrite history from pasted ChatGPT text alone.

Allowed without extra permission:

* git status
* git diff
* git log
* git show
* rg
* find
* build/check/test commands

## Execution Rules

When executing a task from this file:

* inspect current files first
* do not guess from memory
* keep the patch small
* preserve behavior unless the task explicitly asks for behavior change
* do not change models unless explicitly requested
* do not change routes unless explicitly requested
* do not commit unless explicitly requested
* report files changed, checks run, stale references, and any known failures

## Current Task

No active task.

#end
