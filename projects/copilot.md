# 🎨 Projects Dev Relay - APPS

## App Structure

```
fireux/fireux-app/     # Yellow theme :3005
cleanbox/cleanbox-app/ # Green theme  :3007
misebox/misebox-app/   # Blue theme   :3009
```

## Quick Tasks

```bash
# Change app theme
Edit: app.config.ts → colors: { primary: 'newcolor' }

# Unique landing page
Edit: pages/index.vue → app-specific content

# Firebase config
Edit: config/service-account.json + .env

# New app (copy existing)
cp -r fireux/fireux-app newapp/newapp-app
```

## App-Specific Only

- `pages/index.vue` (landing page)
- `app.config.ts` (theme colors)
- Firebase configuration
- **Everything else shared via core module**

## Navigation Relay

**Adding shared features?** → `../packages/copilot.md`
**Need core module details?** → `../packages/fireux-core/copilot.md`
**Back to root commands?** → `../copilot.md`
