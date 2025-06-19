# FireUX Projects

This repository contains multiple application projects built using modern web technologies and deployed to Firebase.

## Projects

### CleanBox

A clean and modern web application built with Nuxt.js.

**Deployment Status:** ✅ Deployed  
**Live URL:** https://cleanbox-f15bc.web.app  
**Theme Colors:** Blue (`#3B82F6`) / Slate (`#64748B`)  
**Technology Stack:** Nuxt.js, Vue.js, TypeScript

### MiseBox

A minimalist application framework.

**Deployment Status:** ✅ Deployed  
**Live URL:** https://misebox-78f9c.web.app  
**Theme Colors:** Green (`#22C55E`) / Slate (`#64748B`)  
**Technology Stack:** Nuxt.js, Vue.js, TypeScript

### FireUX

A UI component library and framework.

**Deployment Status:** ✅ Deployed  
**Live URL:** https://fireux-2005.web.app  
**Theme Colors:** Yellow (`#EAB308`) / Zinc (`#71717A`)  
**Technology Stack:** Nuxt.js, Vue.js, TypeScript

## 🚀 Deployment

All projects are successfully deployed to Firebase Hosting:

### Live Applications

| Application  | Status  | Live URL                                               | Firebase Project | Last Deploy |
| ------------ | ------- | ------------------------------------------------------ | ---------------- | ----------- |
| **CleanBox** | ✅ Live | [cleanbox.web.app](https://cleanbox.web.app)           | `cleanbox-f15bc` | ✅          |
| **MiseBox**  | ✅ Live | [misebox-78f9c.web.app](https://misebox-78f9c.web.app) | `misebox-78f9c`  | ✅          |
| **FireUX**   | ✅ Live | [fireux-2005.web.app](https://fireux-2005.web.app)     | `fireux-2005`    | ✅          |

### Deployment Commands

Each app follows the same Firebase deployment pattern:

```bash
# Deploy CleanBox
cd cleanbox/cleanbox-app
pnpm run build
firebase deploy --only hosting

# Deploy MiseBox
cd misebox/misebox-app
pnpm run build
firebase deploy --only hosting

# Deploy FireUX
cd fireux/fireux-app
pnpm run build
firebase deploy --only hosting
```

### Build Configuration

All apps use Firebase preset for optimal hosting:

```typescript
// nuxt.config.ts (each app)
export default defineNuxtConfig({
  nitro: {
    preset: 'firebase',
  },
})
```

### Firebase Configuration

Each app has its own `firebase.json`:

```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🎨 App Theming

Each app uses a consistent two-color system:

| App          | Primary Color        | Neutral Color       | Config          |
| ------------ | -------------------- | ------------------- | --------------- |
| **CleanBox** | `blue` (`#3B82F6`)   | `slate` (`#64748B`) | `app.config.ts` |
| **MiseBox**  | `green` (`#22C55E`)  | `slate` (`#64748B`) | `app.config.ts` |
| **FireUX**   | `yellow` (`#EAB308`) | `zinc` (`#71717A`)  | `app.config.ts` |

### Changing App Colors

1. **Update** `app/app.config.ts`:

   ```typescript
   export default defineAppConfig({
     ui: {
       colors: {
         primary: 'blue', // Choose from Nuxt UI colors
         neutral: 'slate', // Choose neutral color
       },
     },
   })
   ```

2. **Update** `.env` file with hex values:
   ```bash
   APP_PRIMARY_COLOR=3B82F6  # blue-500 (no # prefix)
   APP_NEUTRAL_COLOR=64748B  # slate-500 (no # prefix)
   ```

> 📚 **See main README.md** for complete color selection guide and Nuxt UI color references.

## Firebase Deployment Process

All projects in this repository are configured for deployment to Firebase with both hosting and Cloud Functions support.

### Prerequisites

1. **Firebase CLI** - Install globally:

   ```bash
   npm install -g firebase-tools@latest
   ```

2. **Authentication** - Login to Firebase:

   ```bash
   firebase login
   ```

3. **Project Setup** - Each project should have:
   - `firebase.json` configured for both hosting and functions
   - `nuxt.config.ts` with Firebase generation 2 configuration

### Deployment Steps

For any project (replace `{project-name}` with actual project directory):

1. **Navigate to project directory:**

   ```bash
   cd projects/{project-name}/{project-name}-app
   ```

2. **Build with Firebase preset:**

   ```bash
   NITRO_PRESET=firebase pnpm run build
   ```

3. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

### Configuration Requirements

#### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  nitro: {
    firebase: {
      gen: 2,
    },
  },
})
```

#### firebase.json

```json
{
  "functions": {
    "source": ".output/server"
  },
  "hosting": {
    "site": "your-project-id",
    "public": ".output/public",
    "cleanUrls": true,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "function": "server" }]
  }
}
```

### Environment Variables

For production environment variables:

1. Copy `.env` to server output after build:

   ```bash
   cp .env .output/server/.env
   ```

2. Or add postbuild script to `package.json`:
   ```json
   {
     "scripts": {
       "postbuild": "cp .env .output/server/.env"
     }
   }
   ```

### Testing Deployed Applications

- **Local Preview:** `firebase emulators:start`
- **Production:** Visit the hosting URL provided after deployment

## Development

Each project follows the same development structure:

- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build locally

## Support

For deployment issues, refer to:

- [Nuxt Firebase Documentation](https://nuxt.com/deploy/firebase)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Nitro Firebase Provider](https://nitro.unjs.io/deploy/providers/firebase)
