# FireUX priorities

Updated: 2026-11-22
Ref: eb57620fa
Role: current work and decisions

## Kitchen development

The [Kitchen Core checkpoint](../reviews/2026-11-20-kitchen-core-independence.md),
independent Items and the [private draft Menu](../handoffs/2026-11-20-kitchen-real-world-build-order.md#phase-b--decide-what-is-sold)
passed locally in Misebox. An operator can assemble and review an unpublished
Menu from existing Items, including Items with no prices yet.
The [Kitchen build order](../handoffs/2026-11-20-kitchen-real-world-build-order.md)
holds the later gates for publication, Services and Orders. The
[Menu and Orders boundary](../concepts/menu-ordering.md) describes today's
public browsing and staff Orders.

## Release and verification gates

- **Misebox production Rules.** Local Core and Workspace validation is
  recorded in the [Stage 6 review](../reviews/2026-11-20-fireux-core-reset-stage-0.md#stage-6-clean-cutover-evidence).
  Review compatibility for the Apps sharing the named database, confirm the
  target and rollback preimage, and obtain separate release approval. Follow
  the [App release checklist](../../projects/misebox/misebox-app/release/README.md#restricted-chef-profile-rollout-checkpoint).
- **Deployed Core User privacy.** The [identity checkpoint](../reviews/2026-11-20-fireux-core-reset-stage-0.md#stages-23-identity-and-provisioning-checkpoints)
  records the last policy evidence for the named FireUX database. The current
  deployed boundary and named-database portal SSR still need verification.
- **Known diagnostics.** The Core reset review records 37 reproduced
  baseline failures. The Items handoff records five existing Misebox typecheck
  errors. Address a reproduced failure when it blocks an accepted slice.
- **Walking Session.** The single-handoff smoke test has
  [completion evidence](../reviews/walking-bridge-smoke-test.md). The bounded
  session still needs its [separately approved live test](../handoffs/2026-11-21-walking-session-smoke-test.md).

## Decisions to confirm before scheduling

- **Recipe ownership.** The [User ownership and Kitchen adoption contract](../concepts/entities.md#recipe-ownership-and-kitchen-use)
  is agreed. Current readers and commands remain Kitchen-scoped. Confirm
  scheduling before starting owner mapping, version/adoption contracts or
  stored-data work.
- **Ignition.** The [assisted App path](../../projects/fireux/fireux-app/ignition/README.md)
  exists. Independent business infrastructure and a dependency-ordered build
  planner remain separate scope. The
  [dependency-order proposal](../handoffs/2026-11-20-entity-core-dependency-ordered-ignite.md)
  is the starting point if promoted.
- **Standalone Ecosystem provisioning.** The trusted command has local
  evidence. Choose and prove an authorized operator entrance if independent
  provisioning is promoted.
- **Item availability and Workspace-first guidance.** Item-wide emergency
  suppression and optional guided import still need explicit product decisions.
  Keep those proposals separate from the draft Menu slice.
- **Commercial work.** Menu Express has [bounded rehearsal evidence](../reviews/menu-express-manual-delivery-2026-10-29.md).
  Confirm its pricing, turnaround and support terms before a paid pilot.
  Stripe and billing are parked. Tier identity, subscription expiry and
  cancellation still need agreement and proof before paid SaaS activation.
  Any retirement of the legacy Firebase Stripe extension and webhook needs
  fresh read-only inventory, a rollback plan and separate authorization.
