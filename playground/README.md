# Playground

Development testing environment for FireUX Core module features and components.

## Purpose

The playground serves as an isolated environment for:

- **Testing new components** before adding them to projects
- **Validating FireUX Core changes** during development
- **Prototyping features** and UI patterns
- **Debugging module functionality** in isolation

## Development

### Start the Playground

```bash
# From root directory
pnpm dev:playground

# Or directly in playground
cd playground
pnpm dev
```

**URL**: http://localhost:3004/

### Configuration

The playground uses the same configuration as production apps:

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

### Testing Assets

The playground automatically serves FireUX Core assets:

- CSS: `/fireux-core/assets/css/main.css`
- SCSS: `/fireux-core/assets/design-system/main.scss`
- Design system utilities and variables

## Development Workflow

1. **Make changes** in `packages/fireux-core`
2. **Test in playground** to validate functionality
3. **Verify asset serving** and component registration
4. **Test in production apps** when ready

## Firebase Setup

Configure Firebase services for testing:

- **Firestore**: Database for testing data persistence
- **Authentication**: Google, Email/Password, Anonymous
- **Storage**: File uploads and asset management

Environment variables in `.env`:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
# ... other Firebase config
```

## Testing

Use the playground to test:

- Component auto-import functionality
- Layout integration
- Composable behavior
- Asset serving
- Firebase integration
- Authentication flows

## Deployment

The playground can be deployed for demo purposes:

```bash
pnpm build
pnpm preview
```

However, it's primarily intended for local development and testing.

````
2. Preview the production build:
```bash
pnpm preview
````

3. Deploy to your hosting provider.
