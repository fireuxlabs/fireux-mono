# Menu and Ordering boundary

Updated: 2026-10-13
Role: map, not canon

## Purpose

Map readable Menu content separately from the Ordering capability. Inherit
AGENTS.md, docs/ai/gpt-context.md and the Misebox scoped context; source and checks
establish behaviour.

## Current boundary

Menu browsing, publication and Offering/Fulfilment configuration retain their
existing owners. `menu/server/offerings/projection.ts` projects configuration;
it does not advertise enabled ordering. Ordering execution and checkout have
been deleted for a deliberate rebuild. Old ordering contexts show an unavailable
rebuild surface; the kiosk detail entrance rejects the retired session flow.
No Order creation, tracking, payment or handoff behaviour is implied by an Offering
configuration or channel declaration. Workspace draft persistence is a separate
Kitchen-owned capability and does not enable customer Menu ordering.

The new Order model and ticket live with Kitchen's first local Ordering consumer.
See `order-processing-kitchen-fulfilment.md` and the named source files there.
Misebox's public runtime configuration declares the draft channel vocabulary;
`kitchen/utils/ordering.ts` validates it when constructing an empty draft.

## Verification and maintenance

Keep Menu browse/publication checks separate from future Ordering behaviour
checks. Update this map when a complete ordering slice returns; do not restore
retired interfaces merely to satisfy a previous test or source pointer.
