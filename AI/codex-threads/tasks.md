# Tasks

Updated: 2026-02-26

Product stack alignment (fireux-products):
- [ ] Standardize toast access in Product Create System (replace runtime fallback with canonical composable).
- [ ] Wrap createProduct() in try/catch/finally so isCreating always resets.
- [ ] Replace browser confirm(...) with shared modal/confirm UX pattern.
- [ ] Decide on Product Create shipping stage (remove or gate via feature/runtime config).
- [ ] Consolidate products index description so page header and meta share one source.
- [ ] Re-validate entity collection managers for new fallback chains.

Asset monitoring:
- [ ] Export FireUX wordmark with true transparency.
- [ ] Add per-app asset findings (Misebox, Cleanbox, Richies, FireUX) to the asset monitoring thread.

Bringli and Drop supplier ownership:
- [ ] Promote fireux-drop from scaffold to Supplier domain owner.
- [ ] Move Supplier models/composables/components/pages from Misebox to Drop.
- [ ] Add temporary compatibility wrappers in Misebox for one release cycle.
- [ ] Verify Bringli routes render without collisions after Supplier migration.
- [ ] Confirm Bringli runtime defaults for runtimeConfig.public.fireux.drop.

Extension system cleanup:
- [ ] Update fireux-products/package.json description (remove TODO).
- [ ] Replace template README in fireux-products with real ownership guardrails.
- [ ] Choose a single module configKey style (domain keys vs fireuxX) and align docs.
- [ ] Document Stripe support and server surface in fireux-products runtime contract.
- [ ] Decide server route registration policy and wire Stripe endpoints if explicit registration wins.
- [ ] Decide product routes injection policy (inject all vs rely on runtime layer).
- [ ] Standardize Nuxt kit import style across extensions (@nuxt/kit vs nuxt/kit).
- [ ] Align fireux-jobs package version with module meta version.
- [ ] Align extension compatibility.nuxt with peerDependency ranges.
- [ ] Remove redundant addImportsDir calls where configureComposables already registers.
- [ ] Resolve route naming inconsistency (fireux-blog-* vs plural package naming).
- [ ] Add missing TypeScript reference for fireux-companies in packages/extensions/tsconfig.json.
- [ ] Replace template READMEs/TODO descriptions in fireux-blogs and fireux-drop.
- [ ] Review peerDependencies for thin modules (for example fireux-drop) and tighten if needed.

Design system:
- [ ] Formalize token naming (colors, spacing, radii).

#end
