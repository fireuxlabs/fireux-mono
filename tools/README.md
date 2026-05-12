# tools

Authority: Tier2 (branch intent)

`tools/` contains repo tooling packages and support utilities.

- Tools are not runtime FireUX modules unless their package explicitly declares that role.
- App/runtime packages should not import from `tools/`.
- Keep reusable runtime behavior in the owning package under `packages/`.
