# 🎨 FireUX Projects

This directory contains production application projects built using the FireUX ecosystem.

## 🚀 Live Applications

| Application  | URL                           | Theme Colors | Status        |
| ------------ | ----------------------------- | ------------ | ------------- |
| **CleanBox** | https://cleanbox.web.app      | Blue/Slate   | ✅ Production |
| **MiseBox**  | https://misebox-78f9c.web.app | Green/Slate  | ✅ Production |
| **FireUX**   | https://fireux-2005.web.app   | Yellow/Zinc  | ✅ Production |

## 🏗️ Architecture

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

## 🚀 Quick Deployment

```bash
# Deploy all three apps at once
./deploy-all.sh

# Or individual deployment
cd cleanbox/cleanbox-app && pnpm build && pnpm exec firebase deploy
cd misebox/misebox-app && pnpm build && pnpm exec firebase deploy
cd fireux/fireux-app && pnpm build && pnpm exec firebase deploy
```

## 📚 Documentation

- [`projects.doc.md`](./projects.doc.md) - Detailed development and deployment guide
- [`../development.doc.md`](../development.doc.md) - Main development workflow
- [`../architecture.doc.md`](../architecture.doc.md) - System architecture overview

## 🎨 Creating New Projects

```bash
# Copy existing project structure
cp -r fireux/fireux-app newproject/newproject-app

# Customize:
# 1. app.config.ts - Theme colors
# 2. firebase.json - Firebase project
# 3. pages/index.vue - Landing page
# 4. .env - Environment variables
```

---

For detailed deployment procedures, troubleshooting, and advanced configuration, see [`projects.doc.md`](./projects.doc.md).
