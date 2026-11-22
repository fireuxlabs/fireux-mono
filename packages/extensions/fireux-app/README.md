# fireux-app

Standard FireUX App composition. `fireux-app/config` selects Core, Blogs,
Products, AI and the native `fireux-app/layer`. The layer owns shared commercial
offers, pricing and public landing presentation (including shared motion), legal documents, and the
Operations, Solutions and Tools catalogue pages and read-only APIs.

Apps own their copy and pricing profiles. Core retains membership, subscription
access and capacity checks, account consent, neutral controls and layout shells.
Main discovery and child-App composition belong to `fireux-ecosystem`.

## Public metadata reference

`FireMeta` presents Core's existing `/api/app/meta` projection with one native
Nuxt acquisition, shared read feedback and error retry. Its Copy, Search and
sharing, and Legal sections render only that public response. Copy is displayed
as escaped plain text, and legal notices reuse `FireLegalNotice`.

An App opts in by placing `<FireMeta />` once inside its own `UPageBody`.
The [Misebox route](../../../projects/misebox/misebox-app/app/pages/meta.vue) and
[FireUX route](../../../projects/fireux/fireux-app/app/pages/meta.vue) are the
working examples: each owns its page header, JSON link, layout, navigation and
`noindex,follow` head policy. The layer registers presentation components, not a
shared `/meta` route. App copy and SEO stay with their authors; Core retains the
public allowlist and media projection.

The [focused consumer checks](src/test/components/Meta.test.mjs) exercise both
route adapters, one acquisition, escaping, social differences and read outcomes.

See [App configuration](../../../docs/concepts/app-config.md) and the
[identity and literature context](../../../docs/ai/identity-literature-context.md).

## App assembly

[`defineFireuxApp`](src/config.ts) validates the App recipe and returns native
Nuxt configuration. [Defaults](src/defaults.ts) supply standard modules and
layers. The App declares the Ecosystem binding and adds the capabilities and
options it uses. Module options register behaviour, layer selection exposes
native surfaces, and Workspace families name the App's enabled management
areas. These are distinct from resource grants.

Keep environment inputs in the [App template](../../../templates/.env.app.template)
and App identity in the authored recipe. Core owns
[Firebase and SEO configuration](../../core/fireux-core/src/config/app/README.md).
Native `app.config.ts` remains the App's presentation owner. The App owns its
Hosting target, public origin and release approval.
