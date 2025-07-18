# 📚 FireUX Documentation

> **Complete documentation for the FireUX ecosystem**

## 🏗️ Architecture & Structure

### **[STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md)**

Complete guide to FireUX's unified structure pattern, enforcement tools, and development practices.

**Quick Commands:**

```bash
pnpm structure:validate  # Validate structure compliance
pnpm structure:fix      # Auto-fix common issues
```

## � Complete Guides

### **[FIREUX_COMPLETE.md](./FIREUX_COMPLETE.md)**

Comprehensive architecture, development, and troubleshooting guide for the entire FireUX ecosystem.

### **[MISEBOX_ROADMAP.md](./MISEBOX_ROADMAP.md)**

Roadmap and feature planning for the Misebox marketplace system.

## 🚀 Quick Start

1. **Structure First**: Always check where something belongs with the [Structure Guide](./STRUCTURE_GUIDE.md)
2. **Follow the Pattern**: Both package/runtime and app/ levels use the same Nuxt structure
3. **Validate Often**: Run `pnpm structure:validate` to maintain compliance
4. **Test Thoroughly**: Use playground environment for testing shared features

## 💡 Key Principles

- **Unified Structure**: Same folder conventions at package and app levels
- **Domain Separation**: Keep domain code in packages, app-specific in apps
- **Automated Enforcement**: Use tools to prevent structural drift
- **Clean Inheritance**: Apps extend package functionality cleanly

> **Need Help?** Start with the [Structure Guide](./STRUCTURE_GUIDE.md) for practical development guidance.

- `fireux-core/core.doc.md` - Core package documentation
- `fireux-jobs/jobs.doc.md` - Jobs domain documentation
- `fireux-jobs/jobs-business.doc.md` - Jobs business logic
- `fireux-jobs/jobs-copilot.doc.md` - Jobs development guidelines

#### `/projects/` - Project-Specific Docs

- `projects.doc.md` - Projects overview
- `misebox/misebox.doc.md` - Misebox app documentation

#### API Documentation

- `packages/fireux-core/src/runtime/server/api/` - API endpoint documentation
  - `api.doc.md` - API overview
  - `firestore/firestore.doc.md` - Firestore API docs
  - `stripe/stripe.doc.md` - Stripe API docs
  - `stripe/stripe-endpoints.doc.md` - Stripe endpoint details
  - `app/app.doc.md` - App API docs

### 🎯 Documentation Conventions

1. **Naming**: Use `.doc.md` suffix for internal documentation
2. **README.md**: Package overviews and setup instructions only
3. **Hierarchy**: Documentation follows the code structure
4. **Content**: Technical details, architecture decisions, development guides

### 📝 Content Guidelines

- **Architecture**: System design, patterns, and principles
- **Business**: Domain logic, user flows, and business rules
- **Development**: Setup, workflow, coding standards
- **API**: Endpoint documentation and integration guides
