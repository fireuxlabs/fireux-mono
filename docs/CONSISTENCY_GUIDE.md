# FireUX Monorepo Consistency Guide

## Standard Configuration Usage

**The Golden Rule:** All tenant apps MUST use the standard configuration template to ensure perfect consistency.

### Quick Setup for New Tenant Apps

1. **Import the standard config:**

```typescript
// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { createStandardNuxtConfig } from 'fireux-core/config/standard-nuxt-config'

export default defineNuxtConfig(
  createStandardNuxtConfig({
    tenantModule: 'fireux-misebox', // Your tenant module
    appName: 'MiseBox', // Full app name
    appShortName: 'MB', // Short name for PWA
    primaryColor: '#10b981', // Brand color
  })
)
```

2. **Standard environment variables (.env):**

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Admin SDK (server-side only)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Critical Patterns

**✅ Module Order (NEVER CHANGE):**

1. `fireux-core`
2. `fireux-jobs`
3. `[tenant-module]`
4. `@nuxt/content`
5. `@nuxt/ui`
6. `@vite-pwa/nuxt`
7. `nuxt-vuefire` (MUST be last)

**✅ Environment Variables:**

- Use standard Firebase variable names
- No `NUXT_PUBLIC_` prefixes (handled automatically by nuxt-vuefire)
- Server-side only admin credentials

**❌ Anti-Patterns:**

- Custom module orders
- Manual Firebase configuration
- Complex interactive tools over simple templates
- Breaking consistency for "features"

### Validation

Your app is consistent if:

- Uses `createStandardNuxtConfig()` import
- Follows proven module order
- Uses standard environment variable names
- No custom Firebase config blocks

**Remember:** Consistency is the main focus of the monorepo. Simple, standard, predictable.
