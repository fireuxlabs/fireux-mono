# 📦 FireUX Package Ecosystem

> **Implementation patterns, architecture decisions, and package development guides**

## 🏗️ Package Architecture

### **Core Infrastructure** → [`/packages/core/fireux-core/docs/`](./core/fireux-core/docs/)

- Framework fundamentals and shared infrastructure
- Authentication, Firestore integration, base components
- Generic patterns for rapid development

### **Domain Extensions**

- **Jobs Marketplace** → [`/packages/extensions/fireux-jobs/docs/`](./extensions/fireux-jobs/docs/)
- **Location Services** → [`/packages/extensions/fireux-places/docs/`](./extensions/fireux-places/docs/)

### **Tenant Implementations**

- **Chef/Supplier Marketplace** → [`/packages/tenants/fireux-misebox/docs/`](./tenants/fireux-misebox/docs/)
- **Cleaning Services** → [`/packages/tenants/fireux-cleanbox/docs/`](./tenants/fireux-cleanbox/docs/)

## 🛠️ Implementation Patterns

### **[FIREUX_IMPLEMENTATION.md](./FIREUX_IMPLEMENTATION.md)**

Comprehensive architecture, development, and troubleshooting guide for the entire FireUX ecosystem.

### **[MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md)**

Complete guide to FireUX's unified structure pattern, enforcement tools, and development practices.

### **[PROFILE_SYSTEM_PATTERNS.md](./PROFILE_SYSTEM_PATTERNS.md)**

Generic profile system implementation strategy for rapid marketplace development.

## 🔧 Package Development

### Auto-Import System

- **fireux-core**: `<Fire...>` prefix (e.g., `<FireButton>`, `<FireCard>`)
- **fireux-jobs**: `<Job...>` prefix (e.g., `<JobCard>`, `<JobForm>`)
- **fireux-misebox**: `<Mise...>` prefix (e.g., `<MiseChefCard>`)
- **fireux-places**: `<Place...>` prefix (e.g., `<PlaceMap>`)

### Package Configuration Pattern

```typescript
// Each package follows identical structure:
configureComponents(resolver, options) // Auto-imports with prefix
configurePages(resolver, nuxt) // Runtime pages discovery
configureComposables(resolver) // Auto-available everywhere
configureModels(resolver, nuxt) // Auto-import models
```

### Workspace Dependencies

```json
{
  "dependencies": {
    "fireux-core": "workspace:*", // ✅ Always use workspace:*
    "fireux-jobs": "workspace:*" // ✅ Never relative paths
  }
}
```

## 🚀 Development Workflow

### Adding New Features

1. **Core Components**: Add to `fireux-core/src/runtime/components/`
2. **Domain Components**: Add to domain packages with appropriate prefix
3. **Pages**: Add to package runtime/pages → Available in apps using that module
4. **Composables**: Add to package runtime/composables → Auto-available

### Testing Strategy

1. Test in playground environment first
2. Validate across all apps using the package
3. Ensure proper auto-import functionality
4. Check for naming conflicts

## 🏛️ Architecture Principles

- **Domain Separation**: No domain code in `fireux-core`
- **Generic First**: Reusable patterns before specific implementations
- **Workspace Consistency**: All packages follow identical structure
- **Auto-Import Prefixes**: Clear namespace separation by package

---

**🏗️ For monorepo operations**: See [`/docs/`](../docs/)  
**🚀 For app deployment**: See [`/projects/docs/`](../projects/docs/)
