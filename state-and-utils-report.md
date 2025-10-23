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

- `packages/tenants/fireux-cleanbox/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
- `packages/tenants/fireux-fireux/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
- `packages/tenants/fireux-misebox/src/runtime/composables/app/utils/effects/useLandingEffect.ts`
