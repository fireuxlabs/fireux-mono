<!-- FILE: drafts/README.md -->

# Drafts

This folder is used to **draft and review real files before updating production code**.

Draft files:
- mirror real file structure
- ignore imports and wiring
- focus on shape, naming, and intent

They are not meant to compile.

## How this is used

1. Copy a real file into `drafts/`
2. Edit it until the shape feels right
3. Promote the changes back into the real file
4. Delete the draft when done (optional)

## Conventions

- Always include a FILE header pointing to the real path
- Imports may be removed or ignored
- Types may be stubbed
- Logic should reflect intended production behaviour

If a draft and a real file disagree, the **draft represents the next intended version**.
