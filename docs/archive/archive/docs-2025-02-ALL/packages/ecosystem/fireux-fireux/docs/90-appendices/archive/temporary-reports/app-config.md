# App Config Inventory

Collected `app.config.ts` contents for each app and the associated brand color palette.

| App               | Primary | Primary Hex | Secondary | Secondary Hex | Neutral | Neutral Hex |
| ----------------- | ------- | ----------- | --------- | ------------- | ------- | ----------- |
| FireUX Core       | yellow  | `#EAB308`   | amber     | `#F59E0B`     | zinc    | `#71717A`   |
| FireUX Tenant     | blue    | `#3B82F6`   | sky       | `#38BDF8`     | zinc    | `#71717A`   |
| Misebox           | green   | `#22C55E`   | lime      | `#84CC16`     | slate   | `#64748B`   |
| Niederhorn        | violet  | `#8B5CF6`   | rose      | `#F43F5E`     | zinc    | `#71717A`   |
| CleanBox          | blue    | `#3B82F6`   | teal      | `#14B8A6`     | gray    | `#6B7280`   |
| Richies Reinigung | blue    | `#3B82F6`   | cyan      | `#06B6D4`     | gray    | `#6B7280`   |

All hex values now flow through each app’s `.env` file via `APP_PRIMARY_COLOR` and `APP_NEUTRAL_COLOR`, and resolve into runtime config for component theming.

```typescript
// projects/cleanbox/cleanbox-app/app/app.config.ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'teal',
      neutral: 'gray',
    },
  },
})
```

```typescript
// projects/cleanbox/richies-reinigung/app/app.config.ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'cyan',
      neutral: 'gray',
    },
  },
})
```

```typescript
// projects/fireux/fireux-app/app/app.config.ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'yellow',
      secondary: 'amber',
      neutral: 'zinc',
    },
  },
})
```

```typescript
// projects/fireux/tennant/app/app.config.ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'sky',
      neutral: 'zinc',
    },
  },
})
```

```typescript
// projects/misebox/misebox-app/app/app.config.ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      secondary: 'lime',
      neutral: 'slate',
    },
  },
})
```

```typescript
// projects/misebox/niederhorn/app/app.config.ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet',
      secondary: 'rose',
      neutral: 'zinc',
    },
  },
})
```
