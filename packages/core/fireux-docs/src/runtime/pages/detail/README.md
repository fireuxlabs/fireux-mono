# Detail Pages

Authority: Operational
Updated: 2026-06-17
Scope: public/runtime detail pages in `packages/*/src/runtime/pages/**` and app-owned `app/pages/**`.

This README records the intended detail-page shape so we can align pages as we touch them.

Do not treat this as a claim that every current detail page is already aligned.

## Core Rule

```text
The page displays the entity.
The public operator panel explains what can be done with it.
```

Detail pages should be thin route composers. They should fetch or receive one entity, render the entity profile/main surface, then hand public actions to a named `XPublicOperatorPanel`.

## Preferred Shape

```vue
<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading x...</p>
      </UPageCard>

      <p v-else-if="!x" class="text-sm text-dimmed">
        X unavailable.
      </p>

      <template v-else>
        <!-- profile -->
        <XCardsProfile :x="x" />

        <!-- main -->
        <XPublicMain :x="x" />

        <!-- operations -->
        <XPublicOperatorPanel :x="x" />

        <!-- dev -->
        <DevJson
          title="X object"
          parent="X detail page"
          :objects="{ x }"
        />
      </template>
    </UPageBody>
  </UPage>
</template>
```

Some families will not need every section. If there is no meaningful main surface yet, keep the comment and omit the component.

## Public Operator Spine

Every public detail family should move toward:

```text
pages/x/[id].vue
  -> XPublicOperatorPanel
    -> XClaimPanel, XOwnerPanel, XUpgradePanel, or XConsolePanel
```

The `XPublicOperatorPanel` receives the current entity object. It should not be static.

Allowed jobs inside the operator panel:

- claim an unclaimed public record
- show owner actions when `created_by` is the current user
- show console/operator entry when the user has operator access
- point to upgrade/onboarding when the record can become a stronger entity
- show public next steps when the viewer is not owner/operator

The public operator panel must not imply authority from a profile relationship. Use stored authority fields such as `claimed_by`, `created_by`, `team_ids`, and `operator_ids` according to the entity canon.

## Current Detail Families

Public/runtime detail entities currently include:

- App
- Ecosystem
- Solution
- User
- Product
- Blog post
- Recipe
- Professional
- Agent
- Job
- Chef
- Ingredient
- Kitchen
- Kitchen menu
- Quick/root menu upload
- Company
- Place
- Supplier
- Portfolio
- Property
- Project
- Module
- Go QR doc/tool records
- Sproochli BnB/info records

Console-scoped child detail routes also exist, especially under `/console/kitchen/**`. They should follow the console spine first, not this public detail page shape.

## Align As Touched

When editing any public detail page:

- Keep the page as a route shell.
- Pass the whole entity object into named child components.
- Prefer `XCardsProfile`, `XPublicMain`, and `XPublicOperatorPanel` over page-owned markup.
- Move repeated derived props into the component or entity interface composable.
- Keep loading and unavailable states simple.
- Keep dev debug at the page edge and separate raw objects from derived values.
- Update this README if a new reusable detail-page pattern appears.

## Do Not Do

- Do not add generic `/operator` child routes.
- Do not create one all-purpose public operator shell that owns domain jobs.
- Do not make detail pages pass many tiny display props when a component can receive the entity.
- Do not infer authority from public profile relationships.
- Do not hide migration or upgrade truth behind route fallbacks.

## Known Drift

Some detail pages are already closer to this shape than others.

Known alignment work to do gradually:

- make older profile/detail pages use the same `profile`, `main`, `operations`, `dev` section order
- add `XPublicOperatorPanel` only where the entity has real public operations
- keep console operation detail pages separate from public detail page canon
- review app-local detail routes before pulling their patterns into shared runtime canon

## Short Version

Detail pages should stay boring.

```text
Fetch entity.
Show profile.
Show main public surface.
Show XPublicOperatorPanel.
Show dev debug.
```

Align each family when we touch it, not in one giant sweep.
