# AGENTS.md

Repository-wide operating entrypoint and context router for `fireux-mono`.

## Mandatory Entry

For every repository task:

1. Read [global context](docs/ai/gpt-context.md) completely.
2. Read [repository hierarchy](docs/concepts/fireux-mono.md).
3. Use the scope router below and read every applicable context or map, then
   inspect current owning source, real consumers, nearest maintained siblings
   and relevant checks. Linked documents are not assumed to load automatically.
4. Follow the global [working rules](docs/ai/gpt-context.md#working-and-verification-rules).
   For implementation and structural changes, complete both mandatory
   [FireUX fit and composition checks](docs/ai/gpt-context.md#mandatory-composition-checks),
   including the source-backed start update and actual-consumer finish review.

Current source establishes behavior; checks prove only their exercised contracts.
Human requirements retain product authority. Follow the global
[evidence](docs/ai/gpt-context.md#evidence-claims),
[rule-review](docs/ai/gpt-context.md#authority-and-rule-review) and
[living-context maintenance](docs/ai/gpt-context.md#living-context-maintenance) rules.

## Scope Router

This is the sole required-context routing table. Read all applicable rows;
routing does not replace source inspection.

| Working scope                                                                 | Required context or map                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| FireUX platform or upstream framework integration                             | `docs/concepts/fireux.md`, then the relevant Nuxt, Nuxt UI, or Firebase map           |
| Repository or package ownership                                               | `docs/concepts/fireux-mono.md`, `docs/concepts/lasagne.md`                            |
| App configuration, module/layer assembly, environment inputs or App roles     | `docs/concepts/app-config.md`, `docs/concepts/family-tenant-global.md`                |
| Core records, shared contracts, identity, membership, access or subscriptions | `docs/concepts/core-models.md`, `docs/concepts/entities.md`                           |
| Runtime placement, models/types/utilities or Nuxt registration                | `docs/concepts/runtime-filesystem.md`, `docs/concepts/runtime-package.md`             |
| Nuxt page, layout or route rendering                                          | `docs/concepts/pages.md`, `docs/concepts/layouts.md`                                  |
| Components, UI styling or composition                                         | `docs/concepts/components.md`, `docs/concepts/lasagne.md`, `docs/concepts/nuxt-ui.md` |
| Readers, reactive state, lifecycle or composables                             | `docs/concepts/composables.md`                                                        |
| Server APIs, projections or trusted commands                                  | `docs/concepts/server-api.md`                                                         |
| Theme settings, appearance or colour mode                                     | `docs/concepts/app-config.md`, `docs/concepts/color-mode.md`                          |
| AI configuration, providers or shared AI presentation                         | `docs/concepts/app-config.md#ai-availability-and-presentation`                        |
| Translation or multilingual copy                                              | `docs/concepts/translation.md`                                                        |
| User-facing sample data, demos or simulated records                           | `docs/concepts/demo-data.md`                                                          |
| Family, canon, spine, alignment, or extraction                                | `docs/concepts/spine.md`, then the named family map                                   |
| Entity lifecycle, data authority or Workspace surfaces                        | `docs/concepts/family-workspace-entity.md`                                            |
| Misebox Apps, ecosystem, or tenants                                           | `packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md`                        |
| Bären tenant or venue-specific operational decisions                          | `projects/misebox/baeren-ringgenberg/docs/ai/baeren-context.md`                       |
| Firestore mutations                                                           | `docs/ai/firestore-mutations-context.md`                                              |
| Product copy or literature                                                    | `docs/concepts/product-language.md`                                                   |
| Main App identity, landing, or pricing literature                             | `docs/ai/identity-literature-context.md`                                              |
| Brand assets                                                                  | `docs/concepts/brand-assets.md`                                                       |
| App ignition and build reconciliation                                         | `packages/extensions/fireux-ignite/docs/ai/ignite-context.md`                         |
| Business identity, Workspace and Company migration                            | `packages/extensions/fireux-businesses/docs/ai/businesses-context.md`                 |
| Reusable booking and calendar integrations                                    | `packages/extensions/fireux-bookings/docs/ai/bookings-context.md`                     |
| Email notifications and delivery adapters                                     | `packages/extensions/fireux-notifications/docs/ai/notifications-context.md`           |
| FireUX App Ignition requests and delivery                                     | `projects/fireux/fireux-app/docs/ai/ignition-intake-context.md`                       |
| Industry research and capability discovery                                    | `packages/extensions/fireux-ai/docs/ai/research-context.md`                           |
| Documentation, public reference or durable docs                               | `docs/concepts/documentation.md`                                                      |
| Apps That Slap                                                                | `packages/ecosystem/fireux-slap/docs/ai/apps-that-slap-context.md`                    |
| BuenoHost                                                                     | `packages/ecosystem/fireux-buenohost/docs/ai/buenohost-context.md`                    |
| Sharer                                                                        | `packages/ecosystem/fireux-sharer/docs/ai/sharer-context.md`                          |
| Landing templates or the starter App                                          | `docs/ai/templates-context.md`                                                        |
| Werkbox                                                                       | `packages/ecosystem/fireux-werkbox/docs/ai/werkbox-context.md`                        |
