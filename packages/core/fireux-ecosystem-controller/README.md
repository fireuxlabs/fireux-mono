# Ecosystem Controller

Shared runtime for global ecosystem apps.

This module currently provides:
- the shared `/api/fireux-console` endpoint for global ecosystem apps
- ecosystem-controller runtime pages like `/apps/[id]`

`defineFireuxConfig({ role: 'global' })` already enables this module automatically, so
ecosystem apps should not need their own duplicated `server/api/fireux-console.get.ts`
route files.
