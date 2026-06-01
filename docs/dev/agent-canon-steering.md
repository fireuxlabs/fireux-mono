# Agent Canon Steering
Status: Operational steering
Authority: Tier2 (Agent workflow guide; Tier1 canon wins)
Updated: 2026-06-01

## Purpose

This is a short pre-edit checklist for AI agents working in FireUX.

It does not define new canon. It turns the existing Tier1/Tier2 canon into a
working habit so agents do not create isolated local shapes before checking the
repo pattern.

## Non-Negotiable Starting Point

FireUX is pattern-first.

Before editing a page, component, composable, API route, model, provider tool, or
console surface, identify the owning family and the nearest sibling
implementation.

Do not start from the visible problem alone.

## Pre-Edit Gate

Before changing files, answer these in order:

1. What family owns this surface?
   Examples: `Menu`, `Kitchen`, `Solution`, `Provider/GoQr`, `Console/Kitchen`.

2. Which package or app owns the family?
   Provider packages own shared domain canon. Apps consume that canon and only add
   app-local pages when the app truly owns the route.

3. What is the nearest sibling?
   Use real files, not guessed similarity. For an entity index, inspect another
   entity index. For a provider tool, inspect another provider tool.

4. Which seam is expected?
   - page: route delivery only
   - component: UI surface such as `Collection/Manager`, `Cards/*`, `Create/System`
   - composable: read/write/state/interface seam such as `useXCollection`
   - model: stored truth and storage shape
   - API: only when transport/storage/provider work requires server authority

5. Is the route public, console, dashboard, admin, docs, dev, or solution?
   Route ownership matters more than visual similarity.

6. Are there generated or registered surfaces?
   Check nav meta, app config, registries, guards, smoke scripts, and package
   exports when the family normally has them.

If any answer is unclear, inspect more sibling files or stop and say what is
unclear. Do not invent a bridge shape.

## Entity Index Shape

Entity index pages use the established shell:

```vue
<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <EntityCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>
```

Common additions are entity-owned CTAs or dev notes when existing siblings use
them. Do not add app-local side panels, tool links, or bespoke cards unless the
nearest sibling pattern already does so or the user explicitly asks for a real
delta.

If the page should not be exposed, remove or omit `nav` meta. Do not replace the
canonical page shape with a one-off dev layout.

## Provider Versus App Ownership

If a provider package already owns a route family, patch the provider package.
Do not create an app-local duplicate only to override copy or layout.

Example:

- `fireux-kitchens` owns the shared `Menu` entity stack.
- Misebox may consume menu routes and add hospitality-specific solution pages.
- Misebox should not fork a provider-owned `Menu` index just to remove a button.

App-local pages are correct when the app owns the route or the product meaning is
not a shared domain surface. Solution pages are a common app-local example.

## Component Folder Rule

Use Nuxt path-based component names from the existing folder pattern.

Prefer established seams:

- `Entity/Collection/Manager.vue`
- `Entity/Cards/Pill.vue`
- `Entity/Cards/Cell.vue`
- `Entity/Create/System.vue`
- `Provider/Name/Tool.vue` for app-side provider consumers
- provider-owned tools in the provider app/package, not copied into consumers

Do not introduce taxonomy folders such as `Organisms`, vague buckets such as
`System` for domain work, or duplicate singular/plural tool folders unless the
repo already uses that exact seam for the family.

## Composable Rule

Keep the boring entity stack boring:

- `useX` is the entity seam.
- `useXFetch` reads one.
- `useXCollection` reads many.
- `useXCreate`, `useXUpdate`, `useXDelete` own writes.
- `useXInterface` adapts records for UI.

Do not hide page-specific composition in `useX`. Keep route/page composition in
the route/page or an explicit feature surface.

## Menu Reminder

Current Menu canon:

- `MenuStorage.shape = 'both'`
- root/public: `menus/{menuId}`
- kitchen-scoped operational: `kitchens/{kitchenId}/menus/{menuId}`
- app overlays may exist only where the current app/console stack explicitly
  uses them

Do not invent a second menu family for public menus, QR menus, uploaded menus, or
translated menus. Those are capabilities or routes consuming `Menu`.

## Practical Failure Smells

Stop and re-check canon when a patch:

- creates a page without checking the nearest sibling page
- adds a wrapper component because the local UI needs spacing
- passes many props through a component instead of finding the provider contract
- duplicates a provider tool in the consuming app
- fixes a route by adding an app-local file while a provider route already exists
- uses words like `public`, `live`, `surface`, or `tool` as storage families
- adds a new folder taxonomy not already present in the owning family

## Minimal Response Discipline

When unsure, say:

> I found the likely family, but I have not found the sibling canon yet.

Then inspect before editing.

Do not present a working page as aligned until the owning route, component seam,
composable seam, and page meta have been checked against siblings.
