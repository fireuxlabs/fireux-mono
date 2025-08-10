## What is FIReUX (quick)
FIReUX is a modular SaaS framework (Nuxt 3 + Firebase + Stripe) delivered as templates, hosted subscriptions, and white‑label apps. See CONTEXT.md for principles and task routing.

## Repo map (packages → projects)
- packages: fireux-core, fireux-jobs, fireux-misebox, fireux-places
- projects: fireux (hub), cleanbox (template/app), misebox (hospitality)

## Business model (scoped)
- Templates → Subscriptions (Basic/Standard/Pro/Full Integration) → White‑label

## Quick start
- Install deps and run any project: pnpm install; pnpm dev:fireux | dev:cleanbox | dev:misebox

Last updated: 2025-08-10
# 🔥 FireUX - Multi-Domain Marketplace Platform

[![Production Status](https://img.shields.io/badge/Status-Production-green.svg)](https://fireux-2005.web.app)
[![Deployment](https://img.shields.io/badge/Deployment-Automated-blue.svg)](#)
[![Monorepo](https://img.shields.io/badge/Structure-Monorepo-orange.svg)](#)

> Modern Nuxt 3 monorepo powering the next generation of service business platforms

## 📚 Documentation

**📖 [docs/STRUCTURE_GUIDE.md](./docs/STRUCTURE_GUIDE.md) - Structure Guide**
Complete guide to FireUX's unified structure pattern and development practices.

**📖 [docs/FIREUX_COMPLETE.md](./docs/FIREUX_COMPLETE.md) - Complete Documentation**
Comprehensive architecture, development, and troubleshooting guide.

**📖 [docs/README.md](./docs/README.md) - All Documentation**
Complete index of all FireUX documentation.

## 🚀 Live Applications

| Application  | URL                           | Theme       | Status        |
| ------------ | ----------------------------- | ----------- | ------------- |
| **FireUX**   | https://fireux-2005.web.app   | Yellow/Zinc | ✅ Production |
| **CleanBox** | https://cleanbox.web.app      | Blue/Slate  | ✅ Production |
| **MiseBox**  | https://misebox-78f9c.web.app | Green/Slate | ✅ Production |

## 🏗️ Architecture

### Domain-Driven Package Structure

- **packages/**: Domain-specific Nuxt modules
  - `fireux-core`: Core framework (Firebase, auth, base components)
  - `fireux-jobs`: Job marketplace functionality (Employer/Professional)
  - `fireux-misebox`: Chef/Supplier marketplace functionality
  - `fireux-places`: Location and places management
- **projects/**: Production applications combining packages
  - `fireux/`: Main platform application (uses core only)
  - `cleanbox/`: Cleaning services marketplace (uses core + jobs)
  - `misebox/`: Culinary services marketplace (uses core + jobs + misebox)

### Package Auto-Import Prefixes

- **fireux-core**: `<Fire...>` - Generic framework components
- **fireux-jobs**: `<Job...>` - Job marketplace components
- **fireux-misebox**: `<Mise...>` - Chef/Supplier marketplace components
- **fireux-places**: `<Place...>` - Location and mapping components

## 📚 Documentation

### Architecture & Development

- [`manuals/architecture.doc.md`](./manuals/architecture.doc.md) - System architecture and design patterns
- [`manuals/development.doc.md`](./manuals/development.doc.md) - Development workflows and guides
- [`manuals/development-copilot.doc.md`](./manuals/development-copilot.doc.md) - AI assistant development guide

### Business & Strategy

- [`manuals/business.doc.md`](./manuals/business.doc.md) - Business model and strategy
- [`manuals/manuals.doc.md`](./manuals/manuals.doc.md) - Specialized guides and references

### Package & Project Documentation

- [`packages/README.md`](./packages/README.md) - Package architecture overview
- [`packages/fireux-core/core.doc.md`](./packages/fireux-core/core.doc.md) - Core framework documentation
- [`packages/fireux-jobs/jobs.doc.md`](./packages/fireux-jobs/jobs.doc.md) - Job marketplace documentation
- [`packages/fireux-misebox/README.md`](./packages/fireux-misebox/README.md) - Chef/Supplier marketplace documentation
- [`projects/README.md`](./projects/README.md) - Applications overview
- [`projects/misebox/misebox.doc.md`](./projects/misebox/misebox.doc.md) - MiseBox application guide

### Current Focus: Domain-Driven Architecture

> **Status**: Package optimization complete ✅
>
> **Completed**:
>
> - Domain-specific package separation
> - Optimized workspace configuration
> - Consistent package structure across all modules
>
> **Next**: Clean up Chef/Supplier code duplication

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:fireux      # Main app     :3000
pnpm dev:cleanbox    # CleanBox app :3007
pnpm dev:misebox     # MiseBox app  :3009
pnpm dev:playground  # Test env     :3005

# Package development
pnpm build:packages  # Build all packages
pnpm dev:packages    # Develop all packages
pnpm clean:packages  # Clean all packages

# Deploy all applications
./deploy-all.sh
```

## 🤝 Contributing

1. Follow the established documentation pattern (`.doc.md` for detailed docs)
2. Test changes across all applications
3. Update relevant documentation when adding features
4. Use the monorepo workflow for package development

---

For detailed information, see the documentation files listed above.
