# FireUX Projects

Production applications built on the FireUX Core module. Each app is nearly identical in functionality but maintains unique theming and branding.

## 🎨 Applications

### 🟡 FireUX (`fireux/fireux-app`)

**Main company application**

- **URL**: http://localhost:3005/
- **Theme**: Yellow primary, zinc neutral
- **Purpose**: FireUX company website and primary application
- **Features**: Full feature set including authentication, blog, products, admin panel

### 🟢 Cleanbox (`cleanbox/cleanbox-app`)

**Organization and productivity tools**

- **URL**: http://localhost:3007/
- **Theme**: Green primary, stone neutral
- **Purpose**: Clean, minimal organization and task management
- **Features**: Organization tools, task management, clean UI design

### 🔵 Misebox (`misebox/misebox-app`)

**Data management platform**

- **URL**: http://localhost:3006/
- **Theme**: Blue primary, gray neutral
- **Purpose**: Data organization and content management
- **Features**: Content organization, data management, user collaboration

## 🏗️ Shared Architecture

All applications inherit from FireUX Core module:

### ✅ Identical Components

- **Pages**: 25+ shared pages (auth, dashboard, admin, blog, products, design system)
- **Components**: 200+ auto-imported UI components
- **Layouts**: Consistent layout system across all apps
- **Configuration**: Same `nuxt.config.ts` and `package.json` structure
- **Firebase Integration**: Authentication and Firestore database
- **Stripe Integration**: Payment processing capabilities

### 🎯 Unique Per App

- **Landing Page**: Custom `pages/index.vue` for each app
- **Color Theme**: Primary and neutral colors via `app.config.ts`
- **Firebase Project**: Separate Firebase projects per app
- **Branding**: App-specific logos and content

## 🛠️ Development

```bash
# Start individual apps
pnpm dev:fireux      # FireUX app
pnpm dev:cleanbox    # Cleanbox app
pnpm dev:misebox     # Misebox app

# Install dependencies for all projects
pnpm install
```

## 📁 Structure

Each app follows identical structure:

```
app-name/
├── app.config.ts     # Theme configuration
├── app.vue          # App root (identical)
├── nuxt.config.ts   # Nuxt config (identical)
├── package.json     # Dependencies (identical)
├── pages/
│   └── index.vue    # Unique landing page
├── config/          # Firebase service account
├── layouts/         # Shared layouts
└── public/          # Static assets
```

## 🔧 Adding New Apps

1. Copy existing app directory structure
2. Update `app.config.ts` with new color theme
3. Create unique `pages/index.vue` landing page
4. Configure Firebase project in `config/service-account.json`
5. Add development script to root `package.json`

All shared functionality is automatically available through the FireUX Core module.

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
