# FireUX Tenant Setup Guide

## Complete Configuration Checklist for New Tenants

This guide ensures consistent setup across all FireUX applications and prevents common configuration issues.

## 📋 **Quick Setup Checklist**

### 1. **Nuxt Configuration (nuxt.config.ts)**

Use the standard template from `packages/core/fireux-core/src/config/standard-nuxt-config.ts`:

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-06-07',
  srcDir: 'app/',
  dir: {
    public: '../public',
  },
  imports: {
    dirs: ['composables/**', 'models/**', 'utils/**'],
  },

  // ✅ CRITICAL: SSR must be enabled
  ssr: true,

  modules: [
    'fireux-core',
    'fireux-jobs',
    'fireux-{YOUR_TENANT}', // e.g., 'fireux-misebox'
    '@nuxt/content',
    '@nuxt/ui',
    'nuxt-vuefire',
  ],

  nitro: {
    preset: 'firebase',
    firebase: {
      gen: 2,
    },
  },

  // ✅ Firebase configuration
  vuefire: {
    auth: {
      enabled: true,
      ssr: true, // ✅ CRITICAL for server-side auth
    },
    config: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
    },
    // ✅ Admin config for server-side operations
    admin: {
      serviceAccount: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    },
  },
})
```

### 2. **Environment Variables (.env)**

**CRITICAL**: You need BOTH standard AND `NUXT_PUBLIC_` prefixed variables:

```env
# ✅ Standard Firebase Configuration (server-side)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# ✅ CRITICAL: Client-side Firebase Configuration (NUXT_PUBLIC_ prefix required)
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ✅ App Configuration
PROJECT_NAME=Your App Name
DOMAIN=http://localhost:3010
PIN=1234
APP_ID=your_app_id
APP_NAME=Your App Name
APP_SHORT_NAME=Short
APP_PRIMARY_COLOR=8B5CF6  # Hex without #
APP_NEUTRAL_COLOR=64748B
APP_ICON=your_icon
AUTHOR_NAME=Your Team Name

# ✅ API Keys (as needed)
OPENAI_API_KEY_NAME=OPENAI_API_KEY
OPENAI_API_KEY=

# ✅ Stripe Configuration (as needed)
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### 3. **App Configuration (app/app.config.ts)**

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet', // Choose from NuxtUI color system
      neutral: 'zinc',
    },
  },
})
```

### 4. **Firebase Service Account**

Create `config/service-account.json` with your Firebase admin credentials:

```json
{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

## 🎨 **Color System**

### Available NuxtUI Colors:

- `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`
- `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`
- `slate`, `gray`, `zinc`, `neutral`, `stone`

### Converting to Hex (for environment variables):

| NuxtUI Color | Hex Value | Usage        |
| ------------ | --------- | ------------ |
| `red`        | `EF4444`  | Red theme    |
| `blue`       | `3B82F6`  | Blue theme   |
| `green`      | `22C55E`  | Green theme  |
| `yellow`     | `EAB308`  | Yellow theme |
| `violet`     | `8B5CF6`  | Purple theme |
| `indigo`     | `6366F1`  | Indigo theme |

Use the 500 shade (middle intensity) for primary colors.

## 🚨 **Common Issues & Solutions**

### Issue: "Neither apiKey nor config.authenticator provided"

**Solution**: Add `NUXT_PUBLIC_` prefixed environment variables

### Issue: Firebase auth not working

**Solutions**:

1. Ensure `ssr: true` in vuefire config
2. Add admin service account configuration
3. Verify all environment variables are set

### Issue: Components not auto-importing

**Solution**: Verify tenant module is listed in modules array

### Issue: Port conflicts

**Solution**: Each app should use unique ports (3000, 3001, 3002, etc.)

## 📁 **Required Directory Structure**

```
your-tenant-app/
├── app/
│   ├── app.config.ts      # ✅ UI color configuration
│   ├── pages/             # App pages
│   ├── components/        # App-specific components
│   └── composables/       # App-specific composables
├── config/
│   └── service-account.json # ✅ Firebase admin credentials
├── public/                # Static assets
├── .env                   # ✅ Environment variables
├── nuxt.config.ts         # ✅ Main configuration
├── package.json
└── tsconfig.json
```

## 🔄 **Development Workflow**

1. **Start Development**: `pnpm dev:your-tenant`
2. **Build Packages**: `pnpm build:packages` (if needed)
3. **Clean Reset**: `pnpm clean:packages` then `pnpm build:packages`

## 📖 **Reference Examples**

### Working Configurations:

- **Misebox**: `projects/misebox/misebox-app/` (green theme)
- **Cleanbox**: `projects/cleanbox/cleanbox-app/` (blue theme)
- **Niederhorn**: `projects/misebox/niederhorn/` (violet theme)
- **FireUX**: `projects/fireux/fireux-app/` (yellow theme)

### Package Modules:

- **Core**: `fireux-core` (always required)
- **Jobs**: `fireux-jobs` (job marketplace)
- **Misebox**: `fireux-misebox` (chef/supplier marketplace)
- **Cleanbox**: `fireux-cleanbox` (cleaning services)
- **Places**: `fireux-places` (location services)

## 🆘 **When Things Go Wrong**

1. **Check Environment Variables**: Ensure both standard and `NUXT_PUBLIC_` versions
2. **Verify Firebase Config**: Compare with working apps
3. **Check Module Order**: `fireux-core` should always be first
4. **Restart Development Server**: Configuration changes require restart
5. **Clear Cache**: Delete `.nuxt` and `node_modules/.cache` if needed

## 📚 **Additional Resources**

- **Architecture Guide**: `docs/FIREUX.md`
- **Package Documentation**: `packages/README.md`
- **Domain Patterns**: `docs/PROFILE_SYSTEM_PATTERNS.md`
- **Standard Config**: `packages/core/fireux-core/src/config/standard-nuxt-config.ts`
