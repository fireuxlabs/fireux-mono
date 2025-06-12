# Packages

This directory contains reusable modules and libraries shared across all FireUX applications.

## `fireux-core`

The core module that provides foundational functionality for all FireUX applications.

### What it provides:

- **Components**: 200+ Vue components for forms, authentication, admin panels
- **Layouts**: Dashboard and default layouts with responsive navigation
- **Composables**: Firebase integration, user management, app configuration
- **Assets**: Complete design system with SCSS variables and utilities
- **Runtime Configuration**: Server and client setup for Nuxt applications

### Key Features:

- Auto-imported components and composables
- Centralized asset serving at `/fireux-core/assets/*`
- Firebase authentication and Firestore integration
- Stripe payment processing
- Blog and product management systems
- Pro subscription functionality

### Development:

```bash
# Navigate to core module
cd packages/fireux-core

# Install dependencies
pnpm install

# Build for distribution
pnpm build

# Test registration and exports
node test-reg.js
```

### Documentation:

- [`fireux-core/README.md`](fireux-core/README.md) - Detailed module documentation
- [`fireux-core/copilot.md`](fireux-core/copilot.md) - AI development guide

## Adding New Packages

To add a new shared package:

1. Create directory: `packages/new-package`
2. Initialize with `package.json` and proper exports
3. Add to workspace in root `pnpm-workspace.yaml`
4. Update this README with package information

## Package Dependencies

All packages should:

- Use TypeScript for type safety
- Export via proper `package.json` exports field
- Include comprehensive documentation
- Provide testing utilities
- Follow FireUX naming conventions
