# fireux-blogs

Owned by `fireux`.

Blog/posts module for FireUX apps.

---

## What it ships

- **Firestore model**: `BlogPost` (`src/runtime/models/objects/blogPost.model.ts`)
- **Runtime pages**:
  - `/blog` (index)
  - `/blog/:slug` (public post page)
  - `/admin/blogs/create` (admin create surface)
  - `/dev/fireux-blogs` (dev surface)
- **Composables**: `useBlogPermissions` (`src/runtime/composables/useBlogPermissions.ts`)
- **Editor/runtime deps**: TipTap + DOMPurify

---

## Guardrails (what it is not)

- Not a full CMS (no workflows/approvals)
- Not a marketing site generator
- Not responsible for publishing pipelines or analytics

---

## Quick start

Enable in a Nuxt app:

```ts
export default defineNuxtConfig({
  modules: ['fireux-blogs'],
})
```

Registry metadata:
- `registry.json`
