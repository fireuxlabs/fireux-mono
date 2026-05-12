# Codex Job List

Authority: Active follow-up queue
Updated: 2026-05-12
Audience: Codex / local coding agents

## How To Use

Pick one job in a dedicated chat and keep that thread scoped to the job. Do not treat this file as permission to stage, commit, push, deploy, or rewrite unrelated work.

## Jobs

### Public Deploy Must Not Render Dev Panels

Status: queued
Priority: high
Suggested thread: public-runtime-debug-gating

Problem:
Dev/debug UI briefly appeared on the deployed public menu experience. A properly deployed public app should not give debug panels a look-in.

Observed context:
- Live app: `https://misebox.app`
- Public routes involved:
  - `/kitchens/luna-picante/menus`
  - `/kitchens/luna-picante/menus/main`
  - `/kitchens/luna-picante/menus/pizza`
- Debug surfaces seen recently include public menu JSON/dev-panel style output.

Goal:
- Ensure FireUX dev/debug panels never render on deployed public pages.
- Local/dev debug tools can remain available where appropriate.
- Console/admin debug affordances should be reviewed separately from public QR/menu routes.

Likely investigation areas:
- FireUX debug/dev panel components
- public menu preview/debug JSON rendering
- runtime environment checks
- deployed production flags
- Nuxt/Firebase app env handling

Checks:
- Public deployed menu pages do not show dev panels, debug JSON, or FireUX dev labels.
- Local development can still use intentional debug tools if gated correctly.
- Menu translation/data behavior remains unchanged.

Out of scope:
- Luna menu translation cleanup
- Firestore menu/dish data changes
- public menu design changes
- deploy unless the dedicated job explicitly reaches that point

