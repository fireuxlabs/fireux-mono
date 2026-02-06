# Asset Monitoring — Sizes & Transparency (Codex Thread)

Editing Rules:
- This is a living document; rewrite for clarity, not chronology.
- Anything below `#end` is scratch and will be deleted on the next update.

Status: **Active**
Version: **v1**
Updated: 2026-02-06

Purpose:
- Track asset quality (size, transparency, correct exports) across FireUX apps.
- Record problems and required fixes (e.g., wordmark opacity or background issues).

Scope:
- App assets under `projects/*/public/img/app/` and related references.

Checks (baseline):
- Wordmarks are truly transparent where expected (no opaque matte).
- Export sizes match intended usage (no blurry scaling).
- Light/dark variants exist where required.
- `srcset` uses 2x where needed.

Current Issues:
- FireUX wordmark has opaque background; needs transparent export.

Notes:
- Add per-app findings here (Misebox, Cleanbox, Richies, FireUX).

#end
