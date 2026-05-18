# Demo Data
Authority: Operational guide; Tier1 canon remains `docs/fireux-canon.md` and `docs/runtime-contract.md`  
Updated: 2026-05-15

## Purpose

`demo/*.demo.ts` files hold repo-level demo entity and view payloads.

Use them for:

- dev component surfaces
- examples and smoke previews
- explicit preflight product pages that clearly run on demo data

Do not use them as:

- Firestore storage canon
- Nuxt Content
- runtime model authority
- console/runtime demo source selection

## Naming

Use:

```txt
demo/<domain>.demo.ts
```

Export names should make the demo status explicit:

```ts
Demo<Entity>
demo<Entity>
demo<Entity>List
demo<Entity>SurfaceList
demo<Entity>PreviewList
```

For runtime console scenarios, do not add files here. Put them in the owning package runtime as `demo-scenarios` or `<domain>-demo-scenarios`.

## Fiction

Demo payloads should feel like one coherent fictional production world.

Use real-sounding names, addresses, businesses, guests, suppliers, kitchens, and
properties in fields a user can see. Avoid user-facing placeholders such as
`Demo Apartment`, `Demo guest`, `Demo Team`, `Demo Street`, or sample addresses.

Implementation ids may still include `demo-*` when that marks source mode or
prevents collisions with live/test records.

## App-Local Demo Data

If a demo record only exists for one app surface, put it under that app's demo folder:

```txt
projects/<ecosystem>/<app>/app/demo/<domain>.ts
```

Use this for app-specific guest guides, public menus, sample info pages, provider cards, and other curated records.

Keep `app/content` for app copy and metadata, usually `app/content/meta.ts`.

## Media

App brand assets belong in:

```txt
projects/<ecosystem>/<app>/public/img/app/*
```

Demo entity media should usually stay URL-backed inside the demo record:

```ts
avatarUrl: 'https://...'
logoUrl: 'https://...'
image_url: 'https://...'
```

Only store demo entity media in an app `public` folder when the task is specifically testing a local asset pipeline.

## Field Shape

When a demo record mirrors storage, use storage-shaped fields:

```ts
image_url
avatar_url
logo_url
```

When a demo record feeds UI cards or view models, use view-shaped fields:

```ts
imageUrl
avatarUrl
logoUrl
```

Demo fields are not canon until promoted to Tier1 docs or the owning package contract.
