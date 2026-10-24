# Business capability library and neutral reference

Reviewed: 2026-10-23
Role: delivery plan, not a release or reuse claim

## Product decision

FireUX is an opinionated industry SaaS framework. Its library unit is a business
capability: interface, data contract, reads, authorised actions and lifecycle
together. Nuxt UI remains the interface foundation. Industry products compose
capabilities and retain meaningful rules. A capability need not equal one package.

The neutral reference demonstrates common responsibilities without disguising a
Kitchen or Property as a universal business. Use the existing Blank reference;
do not create a second neutral App, generic Business Entity or registry by default.
Misebox remains an industry reference, not proof of universal reuse or generation.

## Governing product opinion

The user has selected these defaults as product direction. They govern the
reference build; they do not assert that the target behavior is already shipped.

1. Start with an operating Workspace, not a blank canvas. A public site and
   customer-facing Apps compose around the same supported business capabilities.
2. Use one familiar capability anatomy and interaction language across industries.
   Teams, offerings, work and money should not require relearning basic controls.
3. Reuse native Nuxt UI controls, themes and useful template patterns. FireUX
   owns the added business responsibility, not a competing interface system.
4. A capability connects its interface, data, lifecycle and authorised actions.
   A collection of screens alone is not the library unit.
5. Begin with the ordinary business loop: people, offering, demand, work,
   delivery and money. Enable what the product actually needs; do not force
   every industry into every capability or one universal data schema.
6. Share mechanisms and conventions; preserve meaningful industry rules at
   their owners. Similar naming alone does not establish identical behavior.
7. Ignition is the supported creation process. Surface and improve a missing
   foundation rather than silently bypassing it to ship a standalone prototype.
8. Prefer a clear default to unlimited configuration. Add exceptions when a
   real customer journey proves their value, rather than for speculative edges.

These choices sacrifice arbitrary assembly and repeated local reinvention for
coherence, delivery speed and maintainability. Measure that trade-off through
the neutral reference and independent industry builds.

## Now: initial public-library slice

- Public `/capabilities` is App-owned literature using native Page, Grid, Card,
  Input, Badge and Alert controls. Header navigation reuses route metadata.
- Its searchable catalogue links to actual owners and distinguishes connected
  reference, read-only, presentation-only, primitive and industry-specific source.
- Blank Team has scoped reads/commands. Identity is read-only. Calendar has no
  event source. Products has its own domain; Finance primitives are not accounting.
  Portfolio tasks must not be advertised as a proved neutral work capability.
- This slice adds no data acquisition, command, entitlement, installation service
  or deployment. It does not claim to complete the runtime business loop.

Sources: [catalogue](../../projects/fireux/fireux-app/app/components/Framework/Capabilities.vue),
[page](../../projects/fireux/fireux-app/app/pages/capabilities.vue),
[Blank Team](../../projects/fireux/fireux-blank/app/composables/useBlankWorkspaceTeam.ts),
[Blank Identity](../../projects/fireux/fireux-blank/app/composables/useBlankWorkspaceIdentity.ts),
[Blank Calendar](../../projects/fireux/fireux-blank/app/composables/useBlankWorkspaceCalendar.ts).

## Next: deliver one bounded reference loop

Target: select a business record → manage a team → create an offering → receive
an order → complete work → record money received. Treat this as proposed scope;
each missing authority contract must be resolved before its implementation.

| Slice | Owner and reuse | Acceptance |
| --- | --- | --- |
| Team baseline | Blank commands and Core Team controls | Authenticated create/update/remove, membership revocation and cross-record denial verified; role labels never masquerade as permission grants; no unproved email invitation claim |
| Offering | Inspect Products commands and consumers first | Decide whether existing Product meaning covers the reference offering; prove create/read/update and server price validation without copying Product ownership into Blank |
| Demand | New responsibility requires explicit owner | One customer order, immutable accepted price, caller ownership and idempotent submission; no universal order engine inferred from Kitchen order code |
| Work and time | Compare Portfolio tasks and Property/Kitchen schedules | Begin with order completion unless a real scheduled job is required. Do not rename Property-night allocation into a generic calendar service |
| Money | Finance primitives; domain-owned receipt command | Record an explicitly manual payment fact against the completed order with amount/currency and actor; no implication that external funds moved or that accounting is complete |
| Whole journey | Blank composes supported owners | Refresh, reconnect, account change, duplicate submission and stale writes preserve authority and results; no fake metrics or placeholder actions |

Each slice starts with the mandatory composition check: owner, real sibling,
controls, coordination lifetime and command boundaries. Reuse readers once per
surface, keep route adapters thin, and verify the command and rendered behavior.
Do not move new industry rules into Core merely to finish the reference.

## Nuxt UI reuse review

Compare official [Dashboard](https://github.com/nuxt-ui-templates/dashboard),
[SaaS](https://github.com/nuxt-ui-templates/saas) and
[Calendar](https://ui.nuxt.com/templates) templates with current consumers.
Use upstream components and useful layout patterns through existing owners;
do not copy a second app shell, auth system, data store or offline policy.
No template source has been copied in the initial catalogue slice.

## Later: industry proof and distribution

- Demonstrate the same proved foundations in Misebox and an independent industry
  consumer. Preserve meaningful deltas and compare behavior before extraction.
- Follow the external dog/cat proving sequence in the existing Ignition intake
  context; this reference does not replace that proof.
- Publish installation/API examples only after an independent pinned-artifact
  install works without workspace aliases and exercises actual commands.
- Add customers, documents, notifications, inventory and reporting according to
  demonstrated workflow needs, not to fill every box in the conceptual map.

## Verification and release

Catalogue: generated App typecheck, existing public/Workspace route tests,
desktop/phone filtering and keyboard checks, source-link validation and diff
whitespace check. Build the owning App with no competing dev writer when
publishing; a source-only catalogue is not a deployment.

Runtime slices additionally require meaningful command/authority tests, emulator
integration where atomicity matters and authenticated live acceptance. Inspect
production database/Storage policies and hosting separately before release.

Keep source-reviewed, checks-passed and live journey evidence separate. Record
future execution evidence with the implementing owner. This roadmap is not a
new living context, runtime catalogue or permission source.
