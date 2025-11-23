---
title: Current Pages Inventory
status: working
created: 2025-10-16
---

# Current Pages Inventory

These `index.vue` files correspond to “current” entities — pages that reflect or allow selecting a **current profile, agent, or related object** tied to the active user.

They all need the **Current Entity Block** pattern (show current if exists → otherwise prompt to create/select).

---

## Core runtime

- packages/core/fireux-core/src/runtime/pages/users/index.vue // current (current user)
- packages/core/fireux-core/src/runtime/pages/apps/index.vue // current (active app context)

## Tenant misebox runtime

- packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue // current (current chef)
- packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue // current (current supplier)

## Extensions

- packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue // current (current agent)
- packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue // current (current professional)

---

## Notes

- These are all **Has Current** pages in the broader index inventory.
- Each page will:
  1. Render a `CurrentCard` or compact card block if a current entity exists.
  2. Fall back to a `UAlert` empty state (“No current \_\_\_ yet”).
  3. Offer “Set as current” actions within the main list.

> Shared composable: `useCurrent()`  
> Shared UI element: `CurrentEntityBlock.vue` (optional upcoming component)

---

## Summary

| Context  | Page Path                                                                   | Entity       | Relation                      | Notes                         |
| -------- | --------------------------------------------------------------------------- | ------------ | ----------------------------- | ----------------------------- |
| Core     | `packages/core/fireux-core/src/runtime/pages/users/index.vue`               | User         | Always 1:1 with Firebase auth | Base current user             |
| Core     | `packages/core/fireux-core/src/runtime/pages/apps/index.vue`                | App          | One active app context        | Governs tenant scope          |
| Misebox  | `packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue`         | Chef         | One active chef profile       | Links to professional profile |
| Misebox  | `packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue`     | Supplier     | One active supplier profile   | Powers procurement tools      |
| Jobs Ext | `packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue`     | Agent     | One active agent           | Controls job posting role     |
| Jobs Ext | `packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue` | Professional | One active professional       | Represents job applicant role |
