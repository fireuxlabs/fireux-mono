# Blog authoring and preview map

## Key files
- `packages/extensions/fireux-blogs/src/runtime/pages/blog/create.vue` – entry page; admin-only unless `import.meta.dev`; loads `OrganismsBlogCreateSystem`.
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/System.vue` – tabbed shell (Write/Preview); stubbed publish button (2s timeout) and reset; uses `useCreateBlogPostState`.
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/Write.vue` – Tiptap editor; auto slug + reading time via `useBlogPosts` utils; wires Advanced + Images sections.
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/Advanced.vue` – meta, keywords/tags, canonical, CTA link/text bound to shared state.
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/Images.vue` – image pickers exposing `uploadImages`, `getImageFiles`, `clearImages`; uses `useImageStorage` but not yet called by System publish flow.
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Create/Preview.vue` – DOMPurify-sanitized render of draft with required-field warnings and image previews.
- `packages/extensions/fireux-blogs/src/runtime/composables/firestore/objects/Blog/useCreateBlogPostState.ts` – localStorage-backed draft, default images/author, payload builder, reset helper.
- `packages/extensions/fireux-blogs/src/runtime/composables/firestore/objects/Blog/useBlogPostUtils.ts` – slug generation, reading time, author lookup, default images.
- `packages/extensions/fireux-blogs/src/runtime/composables/firestore/objects/Blog/useBlogCreate.ts` – Firestore `setDocument('blogs', slug, postData)`; not yet used in UI.
- `packages/extensions/fireux-blogs/src/runtime/composables/firestore/objects/Blog/useBlogPosts.ts` – collection/doc fetch + util re-export.
- `packages/extensions/fireux-blogs/src/runtime/components/organisms/Blog/Cards/Page.vue` – renders a published post safely (script tags stripped) for `/blog/[slug]`.
- `packages/extensions/fireux-blogs/src/runtime/pages/blog/[slug].vue` – loads a post by slug and feeds `OrganismsBlogCardsPage`.

## Model
- `packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts` defines `BlogPost` (title, content, metaDescription, slug, created_at, updated_at, author, keywords, tags, canonicalUrl, featuredImage, socialImage, readingTime, cta_link, cta_text, type 'article'|'product', optional product_id, appId).
- `BlogPostEntry` is `BlogPost` without created_at/updated_at/appId for authoring forms.

## Create flow logic
- Gating: `create.vue` allows admins or any user in dev; shows skeleton while loading `useUser`.
- State: `useCreateBlogPostState` stores `blogPost`, `featuredImageData`, `socialImageData` in `useStorage`; on mount auto-fills author and default images; `resetCreateBlogPostState` clears to defaults; `getBlogPostPayload` adds timestamps + appId.
- Authoring: `Create/System.vue` hosts tabs and Publish button; currently just waits 2s, then toast + reset; no persistence or upload calls yet.
- Editing: `Create/Write.vue` loads Tiptap lazily; updates content + reading time on change; watches title to auto-slug; includes Advanced + Images sections.
- Images: `Create/Images.vue` exposes upload helpers but publish flow does not invoke them; progress/errors UI exists.
- Preview: `Create/Preview.vue` renders draft fields, warns when missing, sanitizes HTML; uses runtime appId via `useFireUXConfig`.

## Preview/consumption logic
- `/blog/[slug]` fetches a single doc via `useBlogPosts().fetchBlogPost`; pending skeleton until data resolves; renders `OrganismsBlogCardsPage`.
- `OrganismsBlogCardsPage` displays author + reading time line, meta description, featured image, and sanitized content (strips script tags only).

## Suggestions to improve
- Wire Publish to real create pipeline: validate required fields, call `useBlogCreate().createBlogPost(getBlogPostPayload(), blogPost.slug)`, then route to `/blog/{slug}`.
- Integrate image uploads in publish flow: call `Create/Images.vue` `uploadImages(blogPost.slug)`, then persist returned URLs into payload before save.
- Add validation + inline errors: block publish without title/slug/content/meta/cta_link; surface image upload failures from `uploadErrors`.
- Expand sanitization: align preview and public render with shared sanitizer (DOMPurify) and allowlist tags; strip inline scripts/styles consistently.
- Improve reading time/slug derivation: debounce watchers; ensure `generateSlug` is collision-safe (check existing slugs and append suffix).
- Persist draft recovery: include versioning or timestamp in `useStorage` keys and add manual "restore draft" UI.
- Add tests/storybook: cover slug/reading-time utilities, preview rendering, and publish flow happy-path + failure states.
