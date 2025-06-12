# Projects

This directory contains production applications built on the FireUX Core module.

## Applications

### `fireux/fireux-app`
**Main FireUX application** - Company website and primary application
- **URL**: http://localhost:3005/
- **Purpose**: FireUX company website with authentication, blog, products
- **Firebase**: Primary FireUX project configuration
- **Features**: Full feature set including Pro subscriptions, admin panel

### `misebox/misebox-app` 
**Data management application** - Organized data and content management
- **URL**: http://localhost:3006/
- **Purpose**: Data organization and management tools
- **Firebase**: Dedicated misebox project configuration
- **Features**: Content organization, data management, user collaboration

### `cleanbox/cleanbox-app`
**Organization application** - Clean, minimal organization tools
- **URL**: http://localhost:3007/
- **Purpose**: Reference implementation and template for new projects
- **Firebase**: Dedicated cleanbox project configuration  
- **Features**: Task management, organization tools, clean UI

## Shared Architecture

All applications follow the same architectural patterns:

### Configuration
- **Nuxt 3** with TypeScript
- **FireUX Core** module for shared functionality
- **@nuxt/ui** for additional UI components
- **nuxt-vuefire** for Firebase integration

### CSS Assets
```typescript
css: [
  'fireux-core/assets/css/main.css',
  'fireux-core/assets/design-system/main.scss',
]
```

### Layouts
Each app includes wrapper layouts:
- `layouts/default.vue` → Uses `<CoreDefault />`
- `layouts/dashboard.vue` → Uses `<CoreDashboard />`

### Firebase Configuration
Each app connects to its own Firebase project via environment variables:
```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
# ... other Firebase config
```

## Development

### Starting Applications
```bash
# From root directory
pnpm dev:fireux       # Start FireUX app
pnpm dev:misebox      # Start Misebox app  
pnpm dev:cleanbox     # Start Cleanbox app
```

### Creating New Projects

1. **Create directory structure**:
   ```bash
   mkdir -p projects/new-project/new-project-app
   cd projects/new-project/new-project-app
   ```

2. **Initialize Nuxt app**:
   ```bash
   pnpm dlx nuxi init .
   ```

3. **Configure FireUX Core**:
   ```typescript
   // nuxt.config.ts
   export default defineNuxtConfig({
     modules: ['fireux-core', 'nuxt-vuefire'],
     css: [
       'fireux-core/assets/css/main.css',
       'fireux-core/assets/design-system/main.scss',
     ],
   })
   ```

4. **Add wrapper layouts**:
   ```vue
   <!-- layouts/default.vue -->
   <template>
     <CoreDefault />
   </template>
   ```

5. **Configure Firebase**: Set up environment variables and project

6. **Add dev script** to root `package.json`:
   ```json
   "dev:new-project": "pnpm --filter ./projects/new-project/new-project-app dev"
   ```

### Environment Setup

Each application requires:
- Firebase project configuration
- Stripe keys (for payment processing)
- Environment variables in `.env` file
- Service account JSON for server-side Firebase

## Documentation

- [`fireux/fireux-app/README.md`](fireux/fireux-app/README.md) - FireUX app specifics
- [`misebox/misebox-app/README.md`](misebox/misebox-app/README.md) - Misebox app guide
- [`cleanbox/cleanbox-app/README.md`](cleanbox/cleanbox-app/README.md) - Reference implementation
- [`cleanbox/cleanbox-app/copilot.md`](cleanbox/cleanbox-app/copilot.md) - AI development guide

## Common Patterns

All projects share:
- **Authentication**: Firebase Auth with user management
- **Database**: Firestore with shared composables
- **Payments**: Stripe integration for Pro features
- **Blog**: Content management system
- **Products**: E-commerce functionality
- **Admin Panel**: Management interface
- **Responsive Design**: Mobile-first approach
