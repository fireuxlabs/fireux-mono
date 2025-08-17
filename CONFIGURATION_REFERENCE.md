# 🔧 FireUX Configuration Best Practices

## Quick Reference

### 🚀 **Immediate Action Items**

1. **Use Standard Template**: Always start with `packages/core/fireux-core/src/config/standard-nuxt-config.ts`
2. **Environment Variables**: Set BOTH standard and `NUXT_PUBLIC_` prefixed versions
3. **Firebase Admin**: Include service account configuration for SSR
4. **Color System**: Use NuxtUI color names in app.config.ts, hex in environment variables

### ⚡ **Common Mistakes to Avoid**

| ❌ **Wrong**                    | ✅ **Correct**                                                     | **Impact**                   |
| ------------------------------- | ------------------------------------------------------------------ | ---------------------------- |
| Only setting `FIREBASE_API_KEY` | Setting both `FIREBASE_API_KEY` and `NUXT_PUBLIC_FIREBASE_API_KEY` | Client-side auth fails       |
| `ssr: false` in vuefire config  | `ssr: true` in vuefire config                                      | Authentication timing issues |
| Missing admin serviceAccount    | Including admin serviceAccount                                     | Server-side operations fail  |
| Inconsistent module order       | `fireux-core` first, then extensions                               | Module resolution conflicts  |

## 📊 **Configuration Matrix**

### Working Configurations by App:

| App              | Port | Theme             | Modules              | Status     |
| ---------------- | ---- | ----------------- | -------------------- | ---------- |
| **misebox-app**  | 3000 | Green (`22C55E`)  | core, jobs, misebox  | ✅ Working |
| **cleanbox-app** | 3007 | Blue (`3B82F6`)   | core, jobs, cleanbox | ✅ Working |
| **niederhorn**   | 3002 | Violet (`8B5CF6`) | core, jobs, misebox  | ✅ Working |
| **fireux-app**   | 3000 | Yellow (`EAB308`) | core only            | ✅ Working |

### Environment Variable Patterns:

```bash
# ✅ STANDARD PATTERN (all apps follow this)
FIREBASE_PROJECT_ID=your_project
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project  # Same value!

APP_PRIMARY_COLOR="#8B5CF6"  # Quoted hex with # symbol
```

## 🎯 **Quick Setup Commands**

```bash
# Generate new tenant configuration
cd /path/to/fireux
node scripts/create-tenant.js

# Validate existing configuration
curl http://localhost:3000/dev/config-helper

# Fix common issues
pnpm clean:packages && pnpm build:packages
```

## 📋 **Configuration Checklist**

### Pre-Setup

- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] Domain/port decided
- [ ] Color theme chosen

### Core Files

- [ ] `nuxt.config.ts` using standard template
- [ ] `.env` with both standard and `NUXT_PUBLIC_` variables
- [ ] `app/app.config.ts` with NuxtUI color
- [ ] `config/service-account.json` added

### Validation

- [ ] Server starts without errors
- [ ] Firebase auth works
- [ ] Auto-imports functioning
- [ ] Color theme applied

## 🔍 **Troubleshooting Decision Tree**

```
Error: "Neither apiKey nor config.authenticator provided"
├── Check: NUXT_PUBLIC_* environment variables exist
├── Check: .env file in correct location
└── Check: Nuxt server restarted after env changes

Error: "Cannot resolve module 'fireux-xxx'"
├── Check: Module listed in nuxt.config.ts modules array
├── Check: Package installed (pnpm install)
└── Check: Package built (pnpm build:packages)

Error: Auth not working
├── Check: ssr: true in vuefire config
├── Check: admin serviceAccount configured
└── Check: Firebase rules allow authentication

Error: Components not auto-importing
├── Check: Module order (fireux-core first)
├── Check: Module prefix configuration
└── Check: .nuxt cache cleared
```

## 🎨 **Color System Reference**

### NuxtUI → Hex Conversion:

```javascript
const colorMap = {
  red: 'EF4444',
  orange: 'F97316',
  amber: 'F59E0B',
  yellow: 'EAB308',
  lime: '84CC16',
  green: '22C55E',
  emerald: '10B981',
  teal: '14B8A6',
  cyan: '06B6D4',
  sky: '0EA5E9',
  blue: '3B82F6',
  indigo: '6366F1',
  violet: '8B5CF6',
  purple: 'A855F7',
  fuchsia: 'D946EF',
  pink: 'EC4899',
  rose: 'F43F5E',
}
```

### Usage Pattern:

```typescript
// app.config.ts
export default defineAppConfig({
  ui: { colors: { primary: 'violet' } }, // ✅ NuxtUI name
})

// .env
APP_PRIMARY_COLOR = '#8B5CF6' // ✅ Quoted hex value (required for # symbol)
```

## 📖 **Template Library**

### Minimal nuxt.config.ts:

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: { public: '../public' },
  imports: { dirs: ['composables/**', 'models/**', 'utils/**'] },
  ssr: true,
  modules: [
    'fireux-core',
    'fireux-jobs',
    'fireux-YOUR_TENANT',
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-vuefire',
  ],
  nitro: { preset: 'firebase', firebase: { gen: 2 } },
  vuefire: {
    auth: { enabled: true, ssr: true },
    config: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
    },
    admin: { serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS },
  },
})
```

### Environment Template:

```bash
# Firebase (Server & Client)
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
FIREBASE_PROJECT_ID=project-id
FIREBASE_STORAGE_BUCKET=project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_MEASUREMENT_ID=G-ABC123DEF4
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# Client-side duplicates (CRITICAL)
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123DEF4

# App Config
PROJECT_NAME=My App
APP_ID=my_app
APP_NAME=My App
APP_SHORT_NAME=App
APP_PRIMARY_COLOR="#8B5CF6"  # Quoted hex values required for # symbol
DOMAIN=http://localhost:3010
```

## 🔄 **Update Procedure**

When updating existing tenants to match this standard:

1. **Backup current configs**
2. **Update nuxt.config.ts** to match standard template
3. **Add missing NUXT*PUBLIC* variables** to .env
4. **Add admin serviceAccount** config
5. **Test Firebase auth** and auto-imports
6. **Verify color theming** works

## 📞 **Quick Help**

- **Config Helper Page**: `/dev/config-helper` (when server running)
- **Documentation**: `docs/TENANT_SETUP_GUIDE.md`
- **Working Examples**: Compare with `projects/misebox/misebox-app/`
- **Standard Template**: `packages/core/fireux-core/src/config/standard-nuxt-config.ts`
