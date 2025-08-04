# 🚀 FireUX Projects Documentation

> **Deployment strategies, app configuration, and environment-specific guides**

## 🏗️ Project Architecture

### **Production Apps**

- **FireUX Main** → [`/projects/fireux/fireux-app/`](../fireux/fireux-app/)
- **Misebox** → [`/projects/misebox/misebox-app/`](../misebox/misebox-app/)
- **Niederhorn** → [`/projects/misebox/niederhorn/`](../misebox/niederhorn/)
- **Cleanbox** → [`/projects/cleanbox/cleanbox-app/`](../cleanbox/cleanbox-app/)
- **Richies Reinigung** → [`/projects/cleanbox/richies-reinigung/`](../cleanbox/richies-reinigung/)

## 🛠️ App Configuration

### Theme Customization

Each app customizes:

- **Landing page** and app-specific content
- **Theme colors** and branding
- **Firebase configuration** and project settings
- **Package selection** and feature sets

### Environment Setup

```bash
# Development
pnpm dev:fireux      # :3000 (yellow theme)
pnpm dev:cleanbox    # :3007 (blue theme)
pnpm dev:misebox     # :3009 (green theme)
pnpm dev:playground  # :3005 (test environment)

# Individual deployments
pnpm deploy:fireux
pnpm deploy:cleanbox
pnpm deploy:misebox

# All apps simultaneously
./deploy-all.sh
```

## 🔧 Deployment

### Firebase Hosting

- **Live URLs**:
  - `fireux.web.app`
  - `cleanbox.web.app`
  - `misebox.web.app`

### Build Process

1. Package builds run automatically
2. App-specific configurations applied
3. Firebase deployment pipeline executes
4. Environment variables loaded per project

## 📋 App Development

### Project Structure Pattern

```
projects/[domain]/[app-name]/
├── nuxt.config.ts        # App configuration
├── firebase.json         # Firebase settings
├── app/                  # App-specific overrides
├── content/             # Content management
├── public/              # Static assets
└── server/              # Server-side code
```

### Package Integration

Apps selectively include packages:

```typescript
// nuxt.config.ts
modules: [
  'fireux-core', // Always included
  'fireux-misebox', // Domain-specific
  'fireux-places', // Feature-specific
]
```

## 🎯 App-Specific Documentation

### **Misebox Apps** → [`/projects/misebox/`](../misebox/)

- Chef and supplier marketplace implementations
- Multi-tenant configurations (misebox-app, niederhorn)

### **Cleanbox Apps** → [`/projects/cleanbox/`](../cleanbox/)

- Cleaning services marketplace
- Multi-brand implementations (cleanbox-app, richies-reinigung)

### **FireUX Main** → [`/projects/fireux/`](../fireux/)

- Primary marketplace application
- Core feature demonstrations

---

**🏗️ For monorepo operations**: See [`/docs/`](../../docs/)  
**📦 For implementation patterns**: See [`/packages/docs/`](../../packages/docs/)
