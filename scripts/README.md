# App Initialization System

This system allows you to create identical app clones with different configurations from a single template.

## Quick Start

### 1. Clean All Apps (Optional)
```bash
pnpm run clean:apps
```

### 2. Initialize Apps
```bash
# Initialize all three apps
pnpm run init:cleanbox
pnpm run init:misebox  
pnpm run init:fireux

# Or initialize individually
pnpm run init:app cleanbox
pnpm run init:app misebox
pnpm run init:app fireux
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Deploy Apps
```bash
# Build and deploy each app
cd projects/cleanbox/cleanbox-app
NITRO_PRESET=firebase pnpm run build
firebase deploy

cd ../../../projects/misebox/misebox-app  
NITRO_PRESET=firebase pnpm run build
firebase deploy

cd ../../../projects/fireux/fireux-app
NITRO_PRESET=firebase pnpm run build
firebase deploy
```

## App Configurations

Each app has the following unique configuration:

### CleanBox
- **Colors:** `blue` / `slate`
- **Firebase:** `cleanbox-f15bc` → `cleanbox`
- **Industry:** Cleaning services platform
- **URL:** https://cleanbox.web.app

### MiseBox  
- **Colors:** `violet` / `gray`
- **Firebase:** `misebox-78f9c` → `misebox-78f9c`
- **Industry:** Culinary professionals platform
- **URL:** https://misebox-78f9c.web.app

### FireUX
- **Colors:** `yellow` / `zinc` 
- **Firebase:** `fireux-2005` → `fireux-2005`
- **Industry:** Developer and business platform
- **URL:** https://fireux-2005.web.app

## Generated Structure

Each app gets the following identical structure:

```
projects/{app-name}/{app-name}-app/
├── package.json                 # App-specific name only
├── nuxt.config.ts              # Identical configuration
├── firebase.json               # App-specific site config
├── .firebaserc                 # App-specific project
├── tsconfig.json               # Standard config
├── content.config.ts           # Standard config
├── app/
│   ├── app.config.ts           # App-specific colors
│   ├── app.vue                 # Identical structure
│   ├── pages/
│   │   └── index.vue           # Standard with app name
│   ├── components/
│   ├── composables/
│   └── layouts/
├── content/
│   └── index.md                # Industry-specific content
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── img/
├── config/
└── server/
```

## Key Benefits

1. **Perfect Consistency** - All apps use identical structure and configuration
2. **Easy Maintenance** - Changes to template affect all new apps
3. **Quick Setup** - Create new apps in seconds
4. **Industry Customization** - Each app has industry-specific content and colors
5. **Firebase Ready** - Pre-configured for Firebase deployment

## Customizing Apps

After initialization, you can customize individual apps by editing:

- `app/app.config.ts` - Colors and UI configuration
- `content/index.md` - Landing page content  
- `firebase.json` - Firebase hosting configuration
- `public/` - Assets and static files

## Development Workflow

1. **Initialize** - Use init scripts to create apps
2. **Develop** - Run `pnpm run dev:{app-name}` for development
3. **Test** - Each app runs independently
4. **Deploy** - Build with Firebase preset and deploy

## Adding New Apps

To add a new app, edit `scripts/init-app.js` and add a new configuration to the `APP_CONFIGS` object with:

- `name` - App identifier
- `displayName` - Human readable name
- `description` - App description
- `primaryColor` - UI primary color
- `neutralColor` - UI neutral color  
- `firebaseProject` - Firebase project ID
- `firebaseSite` - Firebase hosting site name
- `industry` - Industry type for content generation

Then add corresponding npm scripts to `package.json`.
