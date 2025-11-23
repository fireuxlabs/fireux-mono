---
title: FireUX Composables Inventory
origin: state-and-utils-report.md
archived-on: 2025-11-10
status: draft
---

> Migrated from `state-and-utils-report.md` on 2025-11-10 during the markdown relocation task.

# FireUX Composables Inventory Report

### Directory: /packages/core/fireux-core/src/runtime/composables/state

```ts
// FILE: /packages/core/fireux-core/src/runtime/composables/state/useUserState.ts
import { useState } from 'nuxt/app'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export type UserState = User | null

export function useUserState() {
  return { user: useState<UserState>('user', () => null) }
}
```

### Directory: /packages/core/fireux-core/src/runtime/composables/app/utils

- `useAvatarProxy.ts`
- `useBreadcrumbs.ts`
- `useEditHandler.ts`

### Tenant-owned effect composables

- `packages/ecosystem/fireux-cleanbox/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
- `packages/ecosystem/fireux-fireux/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
- `packages/ecosystem/fireux-misebox/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
