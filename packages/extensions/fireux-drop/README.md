# fireux-drop

Owned by `fireux`.

Scaffold extension for future drop features.

Today it only:
- Ensures runtime config buckets under `runtimeConfig.public.fireux.drop`
- Exposes runtime exports under `fireux-drop/runtime/*` (for future runtime code)

No pages/components/server routes are shipped yet.

## Quick start

Enable in a Nuxt app:

```ts
export default defineNuxtConfig({
  modules: ['fireux-drop'],
})
```

Registry metadata:
- `registry.json`
