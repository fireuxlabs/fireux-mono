# 🔥 FireUX Ecosystem

[![Production Status](https://img.shields.io/badge/Status-Production-green.svg)](https://fireux-2005.web.app)
[![Deployment](https://img.shields.io/badge/Deployment-Automated-blue.svg)](#)
[![Monorepo](https://img.shields.io/badge/Structure-Monorepo-orange.svg)](#)

> Modern Nuxt 3 monorepo powering the next generation of service business platforms

## 🚀 Live Applications

| Application  | URL                           | Theme       | Status        |
| ------------ | ----------------------------- | ----------- | ------------- |
| **FireUX**   | https://fireux-2005.web.app   | Yellow/Zinc | ✅ Production |
| **CleanBox** | https://cleanbox.web.app      | Blue/Slate  | ✅ Production |
| **MiseBox**  | https://misebox-78f9c.web.app | Green/Slate | ✅ Production |

## 🏗️ Architecture

This monorepo contains:

- **packages/**: Core modules and functionality
  - `fireux-core`: Main framework and server APIs
  - `fireux-jobs`: Jobs marketplace functionality
- **projects/**: Individual applications
  - `fireux/`: Main platform application
  - `cleanbox/`: Cleaning services marketplace
  - `misebox/`: Culinary services marketplace

## 📚 Documentation

- [`architecture.doc.md`](./architecture.doc.md) - System architecture and design patterns
- [`business.doc.md`](./business.doc.md) - Business model and strategy
- [`development.doc.md`](./development.doc.md) - Development workflows and guides
- [`development-copilot.doc.md`](./development-copilot.doc.md) - AI assistant development guide
- [`packages/README.md`](./packages/README.md) - Package overview
- [`manuals/manuals.doc.md`](./manuals/manuals.doc.md) - Specialized guides and references

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:fireux      # Main app     :3005
pnpm dev:cleanbox    # CleanBox app :3007
pnpm dev:misebox     # MiseBox app  :3009
pnpm dev:playground  # Test env     :3000

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
