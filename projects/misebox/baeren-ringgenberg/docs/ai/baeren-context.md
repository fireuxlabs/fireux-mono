# Bären context

Updated: 2026-10-19
Ref: 50e51eb5a
Role: living context
Scope: Bären tenant App and venue-specific operational decisions

## Purpose and inheritance

Keep Bären-specific decisions separate from reusable Misebox behaviour. Inherit
[AGENTS.md](../../../../../AGENTS.md),
[global context](../../../../../docs/ai/gpt-context.md) and
[Misebox context](../../../../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md).

## Ownership and authority

The Bären owner decides actual venue, Kitchen, service and Menu hours, including
seasonal changes and hotel-guest exceptions. Development setup values and website
copy are evidence to review, not owner approval. Do not describe them as verified
operational hours or silently resolve conflicting sources by widening schedules.
Confirm the owner's intended times before treating this setup as ready for service.

The App owns its brand and deployment configuration in
[nuxt.config.ts](../../nuxt.config.ts). Place, Kitchen, Menu and service records
retain their existing domain ownership and commands; Bären-specific hours must
not become defaults or branches in shared runtime code.

## Owner confirmation

The open Breakfast question and its provisional background are saved against
Bären's linked venue, in the `context` string on its `places/{placeId}` document.
Open Identity & brand → Venue context to read or update it. KitchenAI
and MenuAI consume that saved knowledge through the authorized context reader;
this repository file is not automatically injected into either agent.

The owner must confirm Breakfast days and times (06:30 versus 08:00 opening),
hotel-guest restrictions, the parent venue windows including Sunday, and effects
on other services inheriting Kitchen hours. Read current saved settings for the
actual development schedule; do not copy a schedule snapshot into this file.
The [restaurant website](https://www.baeren-ringgenberg.ch/index.php/de/hotel/restaurant-de)
previously conflicted with the development setup. Refresh it as evidence rather
than treating it as owner approval. Recording an owner decision in context does not update hours;
apply an approved decision through the existing hours editors separately.

## Refresh, verification and maintenance

Before Bären work, read the inherited context and current owning source and saved
Workspace settings. Refresh conflicting venue evidence with the owner. Stored
records establish current application behaviour; the owner establishes intended
business hours. Resolve the saved question when the owner decides.

Keep Place → Kitchen → Service → Menu containment and intersection intact. Check
[Menu hours](../../../../../packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-hours.ts)
and [service hours](../../../../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/service-hours.ts),
then run `menu-hours.test.mjs`, `kitchen-operation-hours.test.mjs` and
`kitchen/service-hours.test.mjs` under the Kitchen package's `src/test`.
Verify public availability after authorised settings changes. Prices and Order
submission are separate work; hours verification does not require live orders.
Update this context when Bären-specific ownership or confirmed decisions change;
keep implementation details in their owning source and shared maps.
