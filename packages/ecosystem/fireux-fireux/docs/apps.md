---
title: Apps
description: How the `/apps` route fits into the FireUX canon.
navigation:
  order: 25
---

# Apps

The `/apps` route is the canonical collection view for app records available to the current runtime.

It should stay collection-first:

- browse app cards and rows
- inspect app metadata already resolved for the runtime
- navigate into individual app pages (`/apps/:id`)

Documentation and conceptual explanation belong in `/docs/*`, not in the main collection route.

## What An App Is

Apps are top-level workspaces inside a FireUX ecosystem. An app defines:

- identity (name, short name, brand media)
- scope and role (global/tenant)
- membership relationships (`admin_ids`, app users)
- public-facing content (tagline, description, bios, social links)

## Related Routes

- `/apps` — app collection (runtime UI)
- `/apps/:id` — app profile/details page
- `/dev/apps` — developer inspection, drift, and diagnostics

