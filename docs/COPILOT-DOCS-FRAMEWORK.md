# Copilot Docs Framework

This repository uses a two-layer documentation system:

- Human docs: concise READMEs + deeper chapters in docs/
- Copilot instruction docs: copilot-instructions-*.doc.md (imperative, step-by-step playbooks)

## Conventions
- Keep human docs short; link to chapters.
- Copilot docs are for automation only; no narratives.
- Use tables for env vars and options.
- Avoid duplication between the two layers.

## File Patterns
- README.md
- docs/<chapter>.md
- copilot-instructions-<topic>.doc.md
