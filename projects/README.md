# FireUX Projects

This repository contains multiple application projects built using modern web technologies and deployed to Firebase.

## 🚀 Live Applications

| Application | URL | Theme Colors | Status |
|-------------|-----|--------------|---------|
| **CleanBox** | https://cleanbox.web.app | Blue (`#3B82F6`) / Slate (`#64748B`) | ✅ Production |
| **MiseBox** | https://misebox-78f9c.web.app | Green (`#22C55E`) / Slate (`#64748B`) | ✅ Production |
| **FireUX** | https://fireux-2005.web.app | Yellow (`#EAB308`) / Zinc (`#71717A`) | ✅ Production |

**Technology Stack**: Nuxt.js, Vue.js, TypeScript, Firebase, TailwindCSS

## Project Architecture

### 99% Shared, 1% Unique

All apps inherit from **FireUX Core** module:
- 200+ shared components
- Complete auth & database system  
- Universal routing with authentication
- Shared pages (dashboard, admin, blog, products)
- **Jobs module integration** with public/private routes

### App-Specific Customization

Each app only customizes:
- Landing page (`pages/index.vue`)
- Theme colors (`app.config.ts`)
- Firebase configuration
- Domain-specific branding

### Jobs Module Integration

Both CleanBox and MiseBox include the Jobs module:
- **Public route**: "Jobs" - Always visible for job browsing
- **Private routes**: "Employer Profile", "Professional Profile" - Authentication required
- Seamless dashboard integration
- Industry-specific customization for cleaning and culinary services

## App Initialization System

Create identical app clones with different configurations:

```bash
# Initialize all apps
pnpm run init:cleanbox
pnpm run init:misebox  
pnpm run init:fireux

# Install dependencies
pnpm install
```

## Deployment

### Quick Deploy All

```bash
# Deploy all three apps at once
./deploy-all.sh
```

### Individual Deployment

```bash
# CleanBox
cd cleanbox/cleanbox-app
pnpm build && pnpm exec firebase deploy

# MiseBox
cd misebox/misebox-app
pnpm build && pnpm exec firebase deploy

# FireUX
cd fireux/fireux-app
pnpm build && pnpm exec firebase deploy
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
