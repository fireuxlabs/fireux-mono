# 📦 Packages Dev Relay - PACKAGES

## Core Module Location

`fireux-core/` = **Everything shared**

## Quick Actions

```bash
# Add shared page
Edit: fireux-core/src/runtime/pages/newpage.vue
Register: fireux-core/src/pages-config.ts
→ Auto-available in all apps

# Add shared component
Add: fireux-core/src/runtime/components/organisms/NewComponent.vue
→ Auto-imported as <FireNewComponent>

# Add composable
Add: fireux-core/src/runtime/composables/useNewFeature.ts
→ Auto-available everywhere
```

## Navigation Relay

**Need core module details?** → `fireux-core/copilot.md`
**Back to root commands?** → `../copilot.md`
**Working on apps instead?** → `../projects/copilot.md`

# Test registration system

node test-reg.js

# Test in playground immediately

cd ../../playground
pnpm dev:playground

```

## 🛠️ Core Module Structure

### Key Configuration Files

- `src/module.ts` - Main module definition and setup
- `src/pages-config.ts` - Registers all shared pages with Nuxt
- `src/components-config.ts` - Auto-import configuration for components
- `src/composables-config.ts` - Auto-import configuration for utilities

### Runtime Directory

```

runtime/
├── pages/ # 25+ shared Vue pages
├── components/ # 200+ prefixed components
├── composables/ # Firebase, auth, routing utilities
├── layouts/ # Dashboard and default layouts
└── assets/ # SCSS design system

````

## 🔧 Adding New Features

### New Shared Page

1. Create Vue file in `src/runtime/pages/`
2. Add to `modulePages` array in `src/pages-config.ts`
3. Test with `node test-reg.js`
4. Available in all apps immediately

### New Component

1. Create component in `src/runtime/components/`
2. Use `Fire` prefix (e.g., `FireButton.vue`)
3. Auto-imported across all apps
4. Test in playground first

### New Composable

1. Create in `src/runtime/composables/`
2. Export from appropriate index file
3. Auto-imported with `use` prefix
4. Add TypeScript definitions

## 📋 Best Practices

### Code Organization

- **Pages**: Group by feature (admin/, dashboard/, blog/)
- **Components**: Group by type (atoms/, molecules/, organisms/)
- **Composables**: Group by domain (auth/, data/, utils/)
- **Assets**: Maintain design token structure

### Naming Conventions

- **Components**: `Fire` prefix, PascalCase
- **Composables**: `use` prefix, camelCase
- **Pages**: kebab-case, descriptive routes
- **Assets**: BEM methodology for CSS classes

### Testing Strategy

- **Registration Test**: `node test-reg.js` for module configuration
- **Playground Test**: Validate components in isolated environment
- **App Test**: Verify functionality across all themed apps
- **Build Test**: Ensure module builds without errors

## 🚀 Future Package Development

### When to Create New Packages

- **Specialized Functionality**: Features not needed by all apps
- **External Integrations**: Third-party service wrappers
- **Domain-Specific Logic**: Business logic for specific use cases
- **Performance Optimization**: Heavy features that can be optional

### Package Dependencies

```json
{
  "dependencies": {
    "fireux-core": "workspace:*", // Can depend on core
    "nuxt": "^3.x.x" // Framework dependencies
  }
}
````

### Creating New Package

```bash
# Create package structure
mkdir packages/fireux-newpackage
cd packages/fireux-newpackage

# Initialize package.json with workspace dependency
# Create src/module.ts for Nuxt module
# Add to root pnpm-workspace.yaml
# Document in packages/README.md
```

## 💡 Pro Tips

- **Hot Reload**: Changes to core module trigger rebuilds in all apps
- **TypeScript**: Always provide type definitions for better DX
- **Documentation**: Update READMEs when adding significant features
- **Backward Compatibility**: Avoid breaking changes to maintain app stability
- **Performance**: Use dynamic imports for heavy components

The package system is designed to make adding functionality effortless while maintaining consistency across the entire FireUX ecosystem!
