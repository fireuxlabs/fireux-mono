<!--
source: deployment-config.md (repo root)
imported: 2025-12-08
note: moved from repo root during doc cleanup
-->

# Deployment Config Snapshot

Generated: 2025-11-18

This document captures the current Firebase/Nuxt deployment configuration for the six active FireUX apps. Each section lists the key deployment files exactly as they exist in the repository today.

---

## projects/fireux/fireux-app

**Hosting site**: `fireux`

**Custom domains**: `fireux.app` (verification currently flagged as lost 2025-11-18)

**firebase.json**

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "fireux",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

**.firebaserc**

```json
{
  "projects": {
    "default": "fireux-2005"
  }
}
```

**nuxt.config.ts**

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

**package.json**

```json
{
  "name": "fireux-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3000",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node ../../../scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "@nuxt/icon": "2.x",
    "@nuxt/ui": "^4.0.0-alpha.2",
    "firebase": "11.10.0",
    "firebase-admin": "^12.7.0",
    "firebase-functions": "^6.1.2",
    "fireux-core": "workspace:*",
    "nuxt": "4.1.2",
    "nuxt-vuefire": "^1.1.0",
    "vue": "3.5.20",
    "vue-router": "4.5.1"
  },
  "devDependencies": {
    "@vite-pwa/nuxt": "^1.0.4",
    "rimraf": "^6.0.1",
    "tailwindcss": "^4.1.12"
  }
}
```

---

## projects/fireux/tennant

**Hosting site**: `tennant`

**Custom domains**: none attached

**firebase.json**

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "tennant",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

**.firebaserc**

```json
{
  "projects": {
    "default": "fireux-2005"
  }
}
```

**nuxt.config.ts**

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

**package.json**

```json
{
  "name": "fireux-tennant",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3005",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node ../../../scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "@nuxt/icon": "2.x",
    "@nuxt/ui": "^4.0.0-alpha.2",
    "firebase": "11.10.0",
    "fireux-core": "workspace:*",
    "nuxt": "4.1.2",
    "nuxt-vuefire": "^1.1.0",
    "vue": "3.5.20",
    "vue-router": "4.5.1"
  },
  "devDependencies": {
    "@vite-pwa/nuxt": "^1.0.4",
    "rimraf": "^6.0.1"
  }
}
```

---

## projects/cleanbox/cleanbox-app

**Hosting site**: `cleanbox`

**Custom domains**: none attached

**firebase.json**

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "cleanbox",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

**.firebaserc**

```json
{
  "projects": {
    "default": "cleanbox-f15bc"
  }
}
```

**nuxt.config.ts**

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Cleanbox',
    appShortName: 'Cleanbox',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    role: 'global',
  }),
})
```

**package.json**

```json
{
  "name": "cleanbox-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3002",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node ../../../scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "@nuxt/icon": "2.x",
    "@nuxt/ui": "^4.0.0-alpha.2",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "fireux-cleanbox": "workspace:*",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "nuxt": "4.1.2",
    "nuxt-vuefire": "^1.1.0",
    "vue": "3.5.20",
    "vue-router": "4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62",
    "@nuxt/content": "^3.6.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "rimraf": "^6.0.1"
  }
}
```

---

## projects/cleanbox/richies-reinigung

**Hosting site**: `richies-reinigung`

**Custom domains**: none attached (dedicated tenant site)

**firebase.json**

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "richies-reinigung",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

**.firebaserc**

```json
{
  "projects": {
    "default": "cleanbox-f15bc"
  }
}
```

**nuxt.config.ts**

```typescript
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Richies',
    appShortName: 'Richies',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    role: 'tenant',
  }),
})
```

**package.json**

```json
{
  "name": "richies-reinigung",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3004",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node ../../../scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "@nuxt/icon": "2.x",
    "@nuxt/ui": "^4.0.0-alpha.2",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "fireux-cleanbox": "workspace:*",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "nuxt": "4.1.2",
    "nuxt-vuefire": "^1.1.0",
    "vue": "3.5.20",
    "vue-router": "4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62",
    "@nuxt/content": "^3.6.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "rimraf": "^6.0.1"
  }
}
```

---

## projects/misebox/misebox-app

**Hosting site**: `misebox-78f9c`

**Custom domains**: `misebox.app` (active) and `www.misebox.app` (redirects to `misebox.app`)

**firebase.json**

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "misebox-78f9c",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

**.firebaserc**

```json
{
  "projects": {
    "default": "misebox-78f9c"
  }
}
```

**nuxt.config.ts**

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

**package.json**

```json
{
  "name": "misebox-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3001",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node ../../../scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist",
    "migrate:chefs": "tsx scripts/migrate-chef-data.ts"
  },
  "dependencies": {
    "@nuxt/icon": "2.x",
    "@nuxt/ui": "^4.0.0-alpha.2",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*",
    "nuxt": "4.1.2",
    "vue": "3.5.20",
    "vue-router": "4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62",
    "@nuxt/content": "^3.6.3",
    "@vite-pwa/nuxt": "^1.0.4",
    "nuxt-vuefire": "^1.1.0",
    "rimraf": "^6.0.1",
    "vuefire": "3.2.2"
  }
}
```

---

## projects/misebox/niederhorn

**Hosting site**: `niederhorn`

**Custom domains**: none attached (separate from the global site)

**firebase.json**

```json
{
  "functions": {
    "source": ".output/server",
    "runtime": "nodejs22"
  },
  "hosting": {
    "site": "niederhorn",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

**.firebaserc**

```json
{
  "projects": {
    "default": "misebox-78f9c"
  }
}
```

**nuxt.config.ts**

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

**package.json**

```json
{
  "name": "Niederhorn",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev --port 3003",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "check:env": "node ../../../scripts/check-env.mjs",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "@nuxt/icon": "2.x",
    "@nuxt/ui": "^4.0.0-alpha.2",
    "dompurify": "^3.2.6",
    "firebase": "11.10.0",
    "fireux-core": "workspace:*",
    "fireux-jobs": "workspace:*",
    "fireux-misebox": "workspace:*",
    "nuxt": "4.1.2",
    "nuxt-vuefire": "^1.1.0",
    "vue": "3.5.20",
    "vue-router": "4.5.1"
  },
  "devDependencies": {
    "@iconify-json/heroicons": "^1.2.2",
    "@iconify-json/lucide": "^1.2.62",
    "@vite-pwa/nuxt": "^1.0.4",
    "rimraf": "^6.0.1"
  }
}
```
