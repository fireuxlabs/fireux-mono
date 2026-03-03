# fireux-suppliers
Authority: Tier2 (Overview; Tier1 contract in `docs/contract.md`)

Owned by `fireux`.

Supplier-domain extension for Drop.

It currently:
- Ensures runtime config buckets under `runtimeConfig.public.fireux.drop`
- Exposes runtime exports under `fireux-suppliers/runtime/*`
- Ships supplier runtime domain surfaces (pages/components/composables/models)

Canonical contract:
- `docs/contract.md`

## Quick start

Enable in a Nuxt app:

```ts
export default defineNuxtConfig({
  modules: ['fireux-suppliers'],
})
```

Registry metadata:
- `registry.json`
