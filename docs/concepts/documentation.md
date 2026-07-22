Documentation file map
Updated: 2026-07-22
Ref: to-refresh
Role: map, not canon

Purpose:
Name what each documentation file shape means so agents do not treat every
text file as equal authority.

Vertical links:
- Parent: ../../AGENTS.md
- Child: fireux-mono.md
- Child: spine.md

Horizontal links:
- entities.md
- pages.md
- collection-manager.md

File shapes:
- `AGENTS.md`: short operating router for AI agents in this repo. It points agents to the smallest useful context instead of carrying the full repo rulebook.
- `docs/ai/gpt-context.md`: repo-wide living GPT context. Read it after `AGENTS.md` for every task.
- `docs/ai/*-context.md`: scoped living GPT context for recurring products, ecosystems, package families, or dedicated chats.
- `README.md`: guard-required package/root placeholder or landing map. Do not put canon here unless the user explicitly starts a README rebuild pass.
- `docs/concepts/*.md`: small concept maps for humans and agents. These explain current working context and link related concepts. They are not eternal canon.
- Other `.md`: avoid by default. Use only when a tool/convention requires Markdown, or the user explicitly asks for a formal Markdown document.

Working rule:
- Use `.md` for FireUX concept maps.
- Use `docs/ai/*-context.md` for durable agent context, not temporary task notes.
- Use `README.md` only where guard/package conventions require it.
- Use other `.md` files only for agent/tool conventions such as `AGENTS.md` or explicit formal docs.
- Do not recreate broad historical Markdown docs unless asked.

Authority rule:
- Code, guards, and tests are implementation truth.
- Concept maps are navigation and current working language.
- README placeholders are not truth.

Open questions:
- A future FireUX Docs app may render these maps. Do not design that app from this file yet.
