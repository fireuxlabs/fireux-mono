# 📚 FireUX Documentation

## Documentation Structure

This repository uses a hierarchical documentation structure with `.doc.md` files for internal documentation.

### 📁 Documentation Locations

#### `/manuals/` - Core Documentation

- `architecture.doc.md` - System architecture overview
- `business.doc.md` - Business logic and domain models
- `development.doc.md` - Development setup and workflow
- `development-copilot.doc.md` - AI-assisted development guidelines
- `phantom-prevention.doc.md` - Guide to preventing phantom files
- `documentation-update-summary.doc.md` - Documentation maintenance

#### `/packages/` - Package-Specific Docs

- `packages.doc.md` - Package system overview
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
