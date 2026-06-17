Nuxt UI concept map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Explain the UI library context for agents.

Vertical links:
- Parent: AGENTS.md
- Child: components.md
- Child: pages.md

Horizontal links:
- nuxt4.md
- debug.md

UI stack:
- FireUX uses Nuxt UI / Nuxt UI Pro style components.
- Common shell components include `UPage`, `UPageHeader`, `UPageBody`, `UPageCard`, `UCard`, `UButton`, and dashboard components.

Working style:
- Prefer existing Nuxt UI components over handmade HTML chrome.
- Preserve existing app/package visual language.
- Keep pages composed from domain components where possible.
- Avoid heavy parent scripts that pass many tiny display props; let named child components own local presentation when reasonable.

Design caution:
- Display defaults are okay.
- Fake stored truth is not okay.
- Do not add fallback identity, fake logos, fake avatars, or fake canonical data.

When touching frontend:
- Check nearest sibling page/component first.
- Keep mobile and desktop layout safe.
- Avoid generic AI-looking boilerplate if creating a new visual surface.
