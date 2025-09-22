# All App Nuxt Configs

This document aggregates the Nuxt configuration files for all apps under `projects/` for easy copy/paste.

## projects/misebox/misebox-app/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Misebox',
    appShortName: 'Misebox',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'global',
  }),
})
```

## projects/misebox/niederhorn/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Niederhorn',
    appShortName: 'Niederhorn',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'tenant',
  }),
})
```

## projects/cleanbox/cleanbox-app/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Cleanbox',
    appShortName: 'Cleanbox',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox'],
    role: 'global',
  }),
})
```

## projects/cleanbox/richies-reinigung/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Richies',
    appShortName: 'Richies',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox'],
    role: 'tenant',
  }),
})
```

## projects/fireux/fireux-app/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'FireUX',
    appShortName: 'FireUX',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
    role: 'global',
  }),
})
```

## projects/fireux/tennant/nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'FireUX Tenant',
    appShortName: 'Tenant',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
    role: 'tenant',
  }),
})
```
