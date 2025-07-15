# 🎨 FireUX Projects - Development & Deployment Guide

## 🏗️ Project Architecture Details

### Jobs Module Integration

Both CleanBox and MiseBox include the Jobs module:

- **Public route**: "Jobs" - Always visible for job browsing
- **Private routes**: "Employer Profile", "Professional Profile" - Authentication required
- Seamless dashboard integration
- Industry-specific customization for cleaning and culinary services

### Technology Stack

**Frontend**: Nuxt.js, Vue.js, TypeScript, TailwindCSS, Nuxt UI  
**Backend**: Firebase (Auth, Firestore, Functions), Stripe  
**Deployment**: Firebase Hosting

## 🎨 App Theming System

Each app uses a consistent two-color system:

| App          | Primary Color        | Neutral Color       | Config          |
| ------------ | -------------------- | ------------------- | --------------- |
| **CleanBox** | `blue` (`#3B82F6`)   | `slate` (`#64748B`) | `app.config.ts` |
| **MiseBox**  | `green` (`#22C55E`)  | `slate` (`#64748B`) | `app.config.ts` |
| **FireUX**   | `yellow` (`#EAB308`) | `zinc` (`#71717A`)  | `app.config.ts` |

### Tenant Examples

- **CleanBox**: cleanbox-app, richies-reinigung
- **MiseBox**: misebox-app, niederhorn

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

## 🚀 Firebase Deployment Process

All projects are configured for deployment to Firebase with both hosting and Cloud Functions support.

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

### Advanced Firebase Configuration

For projects requiring Cloud Functions:

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

## 🔧 Development Workflow

### Initial Setup

```bash
# Clone and install dependencies
git clone [repository]
cd fireux
pnpm install

# Start development servers
pnpm dev:fireux      # Main app     :3005
pnpm dev:cleanbox    # CleanBox app :3007
pnpm dev:misebox     # MiseBox app  :3009
pnpm dev:playground  # Test env     :3000
```

### Creating New Projects

```bash
# Copy existing project structure
cp -r fireux/fireux-app newproject/newproject-app

# Customize the following files:
# 1. app.config.ts - Theme colors
# 2. firebase.json - Firebase project
# 3. pages/index.vue - Landing page
# 4. .env - Environment variables
# 5. package.json - Project name and scripts
```

### App-Specific Customization

Each app requires minimal customization:

#### 1. Theme Colors (`app/app.config.ts`)

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald', // New primary color
      neutral: 'gray', // New neutral color
    },
  },
})
```

#### 2. Firebase Configuration (`firebase.json`)

```json
{
  "hosting": {
    "site": "your-new-project-id",
    "public": ".output/public"
    // ... rest of configuration
  }
}
```

#### 3. Landing Page (`pages/index.vue`)

Create a unique landing page that reflects the app's purpose while inheriting all shared functionality.

#### 4. Environment Variables (`.env`)

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-new-project-id
FIREBASE_API_KEY=your-api-key
# ... other variables
```

## 🐛 Common Deployment Issues

### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules .nuxt .output
pnpm install
pnpm run build
```

### Firebase Authentication Issues

```bash
# Re-authenticate with Firebase
firebase logout
firebase login
firebase use --add your-project-id
```

### Environment Variable Issues

1. Verify all required variables are in `.env`
2. Ensure environment variables are copied to build output
3. Check Firebase project configuration

### Module Resolution Issues

```bash
# Rebuild packages first
pnpm run build:packages

# Then rebuild app
cd projects/[app-name]/[app-name]-app
pnpm run build
```

## 📊 Testing & Validation

### Local Testing

```bash
# Start development server
pnpm run dev

# Build and preview locally
pnpm run build
pnpm run preview
```

### Firebase Emulator Testing

```bash
# Start Firebase emulators
firebase emulators:start

# Test functions and hosting locally
firebase emulators:start --only hosting,functions
```

### Production Validation

After deployment, verify:

- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Database connections are functional
- [ ] API endpoints respond
- [ ] Jobs module integration (if applicable)

## 📈 Performance Optimization

### Build Optimization

- Use `nitro.preset: 'firebase'` for optimal Firebase builds
- Enable compression in Firebase hosting
- Implement proper caching strategies

### Code Splitting

Nuxt 3 automatically code splits, but you can optimize further:

- Lazy load heavy components
- Use dynamic imports for large libraries
- Implement route-based code splitting

### Asset Optimization

- Optimize images with Nuxt Image module
- Use appropriate image formats (WebP, AVIF)
- Implement proper CDN caching

## 📚 References

For deployment issues, refer to:

- [Nuxt Firebase Documentation](https://nuxt.com/deploy/firebase)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Nitro Firebase Provider](https://nitro.unjs.io/deploy/providers/firebase)
- [`../development.doc.md`](../development.doc.md) - Main development guide
- [`../architecture.doc.md`](../architecture.doc.md) - System architecture
