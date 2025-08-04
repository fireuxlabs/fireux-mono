# 🏗️ FireUX Monorepo Documentation

> **Monorepo operations, workspace configuration, and development workflows**

## 🚀 Quick Start

```bash
# Start development
pnpm dev:fireux      # :3000 (yellow theme)
pnpm dev:cleanbox    # :3007 (blue theme)
pnpm dev:misebox     # :3009 (green theme)
pnpm dev:playground  # :3005 (test environment)

# Package development
pnpm build:packages  # Build all packages
pnpm dev:packages    # Develop all packages
pnpm clean:packages  # Clean all packages

# Deployment
./deploy-all.sh      # Deploy all apps
```

## 📚 Documentation Structure

### **Root Level** (This Directory)

- **Monorepo operations only**
- Workspace configuration
- Development workflows
- Build and deployment pipelines

### **Package Level** → [`/packages/docs/`](../packages/docs/)

- Package ecosystem overview
- Implementation patterns and architecture
- Core infrastructure documentation

### **App Level** → [`/projects/docs/`](../projects/docs/)

- Deployment strategies
- Individual app documentation
- Environment-specific guides

## 🛠️ Development Workflows

### Package Management

- **Workspace Dependencies**: Use `workspace:*` for internal packages
- **Auto-Import System**: Components auto-import with package prefixes
- **Build System**: Uses `nuxt-module-build` for proper packaging

### Development Best Practices

- **Domain Separation**: Keep domain logic in appropriate packages
- **Generic First**: Add shared functionality to `fireux-core`
- **Validation**: Test in playground before deploying to apps

## 🔧 Operational Guides

### **[PHANTOM_PREVENTION.md](./PHANTOM_PREVENTION.md)**

VS Code workflow patterns to prevent file resurrection issues.

### **[CONTENT_STRATEGY_NOTES.md](./CONTENT_STRATEGY_NOTES.md)**

Documentation strategy and scope separation guidelines.

## 🏗️ Monorepo Architecture

```
packages/
├── core/fireux-core/          # Framework fundamentals
├── extensions/fireux-jobs/     # Jobs marketplace
├── tenants/fireux-misebox/    # Chef/supplier marketplace
└── tenants/fireux-cleanbox/   # Cleaning services

projects/
├── fireux/fireux-app/         # Main FireUX app
├── misebox/misebox-app/       # Chef marketplace app
└── cleanbox/cleanbox-app/     # Cleaning services app
```

## 📋 Build Scripts

```bash
# Structure validation
pnpm structure:validate    # Check structure compliance
pnpm structure:fix        # Auto-fix common issues

# Package operations
pnpm workspace <package> <command>  # Run command in specific package
pnpm -r <command>                   # Run command in all packages
```

---

**📖 For implementation details**: See [`/packages/docs/`](../packages/docs/)  
**🚀 For deployment guides**: See [`/projects/docs/`](../projects/docs/)
