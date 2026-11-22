# Identity and product literature context

Updated: 2026-11-22
Ref: 336c1aafc
Role: living context
Scope: shared Main App identity, landing, pricing, product literature and public metadata

## Purpose and inheritance

Inherit [AGENTS.md](../../AGENTS.md) and [global context](gpt-context.md).
Use this router to decide who owns a public product claim, commercial policy
or presentation change. Follow [product language](../concepts/product-language.md)
and the owning App or ecosystem context for the detail.

Compare FireUX with the global Ecosystem Main Apps. Tenant Apps provide evidence
for supported journeys and own their customer-facing copy. Include standalone
Apps where they use the shared presentation or language.

## Ownership and language

Use the [product language map](../concepts/product-language.md) for commercial
terms and the [repository map](../concepts/fireux-mono.md) to find package owners.
The App owns its claims and offers. Confirm those claims against the domain
routes, readers, commands and access policy that implement them.

## Public presentation

- Main Apps compose their own Hero, pricing, product surfaces and deeper
  features over the shared
  [Product landing](../../packages/extensions/fireux-app/src/runtime/components/landing/ProductIndex.vue).
  Use its existing region order and surface rules. Route-specific landing
  choices belong with the App. See the documented
  [Misebox Hero](../../packages/ecosystem/fireux-misebox/docs/ai/misebox-context.md#apps-and-workspace)
  and [Slap motion](../../packages/ecosystem/fireux-slap/docs/ai/apps-that-slap-context.md#scope-and-ownership-boundaries)
  choices.
- [Shared pricing](../../packages/extensions/fireux-app/src/runtime/app/composables/pricing/usePricing.ts)
  supplies commercial amounts and formulas. Each Main App owns its tier
  selection, capability limits and eligible offers. Tenant pricing follows the
  tenant's own customer offer.
- [FireUX platform literature](../concepts/fireux.md#fireux-app-public-literature)
  owns the framework, source guide and ecosystem-creation path. A Main App
  may advertise a branded App within its existing ecosystem when a supported
  workflow exists. [Core App initialization](../../packages/core/fireux-core/src/runtime/server/api/internal/app/initialize.post.ts)
  is internal setup.
- The [entrance map](../concepts/workspace.md#public-and-workspace-entry-points)
  owns public Home and Workspace arrival differences. The
  [artwork map](../concepts/brand-assets.md#photographic-media) owns shared image
  guidance.

## Authority and source references

Start with the owning routes, authored copy, catalogues, readers and commands.
Compare the nearest maintained Main App or shared component before changing
a claim. A landing summarises its child offers and capabilities.

Core owns the [public metadata projection](../../packages/core/fireux-core/src/runtime/app/server/index/meta.ts).
The App bundle owns the shared viewer. Each App selects its own
[metadata route and indexing policy](../concepts/app-config.md#public-metadata-reference).
Consult page-level head source for overrides.

## Maintenance and verification

1. Edit the smallest owned source and trace changed claims through the
   containing pricing, Product or landing surface.
2. Check its actual routes, actions, public data and applicable SEO policy.
   Use focused tests and check phone and desktop presentation when a screen
   changes.
3. Update this router when shared scope or ownership changes. Keep App-specific
   exceptions in their owner context and transient findings in reviews.
