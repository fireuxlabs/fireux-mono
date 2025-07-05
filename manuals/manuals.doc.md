# 📚 FireUX Manuals & Guides

This directory contains specialized guides and reference materials for the FireUX ecosystem. These complement the main documentation system with topic-specific, in-depth information.

## 📖 Available Guides

### Component Libraries

- **Nuxt UI Reference** - Quick reference for Nuxt UI components (planned)
- **TailwindCSS Patterns** - Common styling patterns used in FireUX (planned)

### Development Workflows

- **Module Development** - Creating new FireUX modules (planned)
- **Testing Strategies** - Testing patterns for monorepo development (planned)

### Infrastructure

- **Firebase Setup** - Complete Firebase configuration guide (planned)
- **Stripe Integration** - Payment processing implementation (planned)

## 🗂️ Manual Organization

All manual files should follow the `.doc.md` pattern to ensure they're excluded from production builds while remaining visible in the repository.

### Creating New Manuals

1. Create the manual file with `.doc.md` extension
2. Add entry to this index
3. Cross-reference from relevant documentation

### Example Structure

```
manuals/
├── manuals.doc.md           # This index file
├── nuxtui-reference.doc.md  # Nuxt UI component reference
├── testing-guide.doc.md     # Testing strategies
└── deployment.doc.md        # Deployment procedures
```

## 🔗 Cross-References

- [`architecture.doc.md`](../architecture.doc.md) - System architecture overview
- [`development.doc.md`](../development.doc.md) - Main development guide
- [`packages/fireux-core/core.doc.md`](../packages/fireux-core/core.doc.md) - Core module documentation

---

To contribute a new manual, create a markdown file with the `.doc.md` extension and update this index.
