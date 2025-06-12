# FireUX Packages

Shared modules and libraries that power the FireUX ecosystem.

## 📦 Available Packages

### `fireux-core/`

**The foundational module** for all FireUX applications.

- **25+ Shared Pages**: Authentication, dashboard, admin, blog, products, design system
- **200+ Components**: Auto-imported, prefixed UI components with consistent styling
- **Firebase Integration**: Built-in authentication and Firestore database
- **Stripe Integration**: Payment processing for products and subscriptions
- **Design System**: Consistent styling, layouts, and asset serving
- **Auto-imported Composables**: Authentication, data management, routing utilities

See [fireux-core README](./fireux-core/README.md) for detailed documentation.

## 🏗️ Package Architecture

### Shared Everything Principle

All FireUX applications inherit functionality from packages rather than duplicating code. This ensures:

- **Consistency**: All apps behave identically
- **Maintainability**: Updates benefit all apps simultaneously
- **Rapid Development**: New apps can be created in minutes
- **Type Safety**: Shared TypeScript definitions across the ecosystem

### Module Structure

```
packages/
└── fireux-core/
    ├── src/
    │   ├── module.ts              # Module definition
    │   ├── pages-config.ts        # Page registration
    │   ├── components-config.ts   # Component auto-imports
    │   └── runtime/
    │       ├── pages/             # 25+ shared pages
    │       ├── components/        # UI component library
    │       ├── composables/       # Utility functions
    │       ├── layouts/           # Layout system
    │       └── assets/           # CSS/SCSS files
    ├── package.json
    └── README.md
```

## 🚀 Development

### Adding New Packages

When the ecosystem grows, new packages can be added following the same pattern:

```bash
# Example future packages
packages/
├── fireux-core/         # Current foundational module
├── fireux-ui/           # Future specialized UI components
├── fireux-auth/         # Future authentication module
└── fireux-payments/     # Future payment processing module
```

### Package Dependencies

Packages can depend on each other, creating a layered architecture where specialized packages build upon the core foundation.

## 🔧 Best Practices

- **Single Responsibility**: Each package should have a clear, focused purpose
- **TypeScript First**: All packages should provide full type safety
- **Auto-imports**: Components and composables should be auto-imported where possible
- **Documentation**: Each package must have comprehensive README and usage examples
- **Testing**: All packages should include unit tests and integration tests
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
