# 🔥 FireUX Ecosystem

_Modern Nuxt 3 monorepo powering the next generation of service business platforms_### Adding Jobs Functionality ✨

The new Jobs module demonstrates the power of our modular architecture:

```bash
# Jobs module is already integrated! ✅
# Access via dashboard navigation in Cleanbox and Misebox:
# - /dashboard/employer-profile
# - /dashboard/professional-profile

# To add jobs to a new app:
# 1. Add module to nuxt.config.ts
modules: ['fireux-jobs']

# 2. Import routes in layouts
import { getJobRoutes } from 'fireux-jobs/composables'
const jobRoutes = getJobRoutes()

# 3. Pass to core layouts
<CoreDashboard :extras="jobRoutes" />
```

### Extending Jobs Module

```bash
# Add new job-related page
touch packages/fireux-jobs/src/runtime/pages/dashboard/job-posting.vue
# Register in packages/fireux-jobs/src/module.ts
# Available in all apps using the module

# Add job-specific composable
touch packages/fireux-jobs/src/runtime/composables/useJobManagement.ts
# Export in packages/fireux-jobs/src/runtime/composables/index.ts
# Auto-imported as useJobManagement() wherever jobs module is used
```

## 📚 Documentation

Each level has three documentation files for different audiences:
```bash
# Clone and install
git clone https://github.com/your-org/fireux
cd fireux
pnpm install

# Start development
pnpm dev:fireux      # Main app    (localhost:3005)
pnpm dev:cleanbox    # CleanBox    (localhost:3007)
pnpm dev:misebox     # Misebox     (localhost:3009)
pnpm dev:playground  # Testing     (localhost:3000)
```

## 🏗️ Architecture

**99% Shared, 1% Unique** - Three production apps powered by shared modules:

- **`packages/fireux-core/`** - Shared Nuxt 3 module (200+ components, pages, composables)
- **`packages/fireux-jobs/`** - Universal job management system for service industries
- **`projects/fireux/`** - Main company app (yellow theme)
- **`projects/cleanbox/`** - Cleaning industry platform (green theme)
- **`projects/misebox/`** - Culinary industry platform (blue theme)

## 🛠️ Technology Stack

### Frontend

- **Nuxt 3** - Full-stack Vue framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Nuxt UI** - Component library

### Backend & Services

- **Firebase Auth** - Authentication system
- **Firestore** - NoSQL database
- **Stripe** - Payment processing
- **Cloudinary** - Image management

### Development

- **pnpm Workspaces** - Monorepo management
- **ESLint & Prettier** - Code quality
- **Auto-imports** - Component/composable resolution

## 📁 Monorepo Structure

```
fireux/
├── packages/                # Shared modules
│   ├── fireux-core/         # Core Nuxt 3 module (99% shared functionality)
│   │   ├── src/runtime/     # 200+ components, pages, layouts
│   │   ├── src/module.ts    # Module configuration
│   │   └── src/*-config.ts  # Auto-import configurations
│   └── fireux-jobs/         # Job management module ✨ NEW
│       ├── src/runtime/     # Job models, pages, composables
│       └── src/module.ts    # Jobs module configuration
├── projects/                # Production applications
│   ├── fireux/fireux-app/   # Main company app (yellow)
│   ├── cleanbox/cleanbox-app/ # Cleaning platform (green) + Jobs ✅
│   └── misebox/misebox-app/   # Culinary platform (blue) + Jobs ✅
├── playground/              # Development testing (red)
└── pnpm-workspace.yaml      # Workspace configuration
```

## 🎯 Key Features

### Shared Functionality (via FireUX Core)

- **Authentication** - Firebase Auth with user management
- **Database** - Firestore with auto-imported composables
- **Payments** - Stripe integration for subscriptions
- **Blog System** - Content management with rich text editor
- **Product System** - E-commerce with inventory management
- **Admin Panel** - Complete management interface
- **Design System** - TailwindCSS + Nuxt UI components

### ✨ Jobs Module (via FireUX Jobs) - **NEW**

- **🏢 Employer Profiles** - Company information and job posting management (`/dashboard/employer-profile`)
- **👤 Professional Profiles** - Service worker profiles for cleaning/culinary industries (`/dashboard/professional-profile`)
- **🔗 Route Integration** - Seamless dashboard navigation integration
- **🌍 Universal Design** - Works across cleaning and culinary business platforms
- **📦 Modular Architecture** - Optional 4.1kB module that extends existing apps
- **⚡ Zero Breaking Changes** - Fully backward compatible with existing functionality

**Production Status**: ✅ Live in both Cleanbox and Misebox apps

### App-Specific

Each app inherits all shared functionality but customizes:

- Landing page (`pages/index.vue`)
- Theme colors (`app.config.ts`)
- Firebase configuration
- Domain-specific content
- **Job module integration** (optional via `extras` prop)

## 🚀 Development

### Adding Shared Features

All shared functionality goes in `packages/fireux-core/`:

```bash
# Add new shared page
touch packages/fireux-core/src/runtime/pages/new-feature.vue
# Register in packages/fireux-core/src/pages-config.ts
# Available in all apps immediately

# Add new component
touch packages/fireux-core/src/runtime/components/organisms/NewComponent.vue
# Auto-imported as <FireNewComponent> in all apps

# Add new composable
touch packages/fireux-core/src/runtime/composables/useNewFeature.ts
# Auto-imported in all apps
```

### Creating New Apps

```bash
# Copy existing app structure
cp -r projects/fireux/fireux-app projects/newapp/newapp-app
# Customize theme, Firebase config, and landing page
```

## 📚 Documentation

### Three-Document System

Each level of the monorepo maintains three types of documentation:

**README.md** - Technical overview and implementation guide  
**📦 fireux-jobs** - Universal job management module for service industries

Each level has three documentation files for different audiences:

**README.md** - Technical teams (setup, APIs, implementation)  
**copilot.md** - AI assistant development workflows and fast reference  
**BUSINESS.md** - Business model, value propositions, and strategic context

### Documentation Structure Overview

```
fireux/
├── README.md                    # 🏠 Technical overview & implementation
├── copilot.md                   # 🤖 AI workflows & quick reference
├── BUSINESS.md                  # 💼 Business strategy & value props
├── packages/
│   ├── fireux-core/
│   │   ├── README.md            # 🎯 Core API & feature documentation
│   │   ├── copilot.md           # ⚙️ Internal development guide
│   │   └── BUSINESS.md          # 💎 Core module revenue impact
│   └── fireux-jobs/             # ✨ NEW
│       ├── README.md            # 🏢 Jobs module API & integration guide
│       ├── copilot.md           # 🛠️ Jobs development workflows & learnings
│       └── BUSINESS.md          # 💰 Jobs market strategy & business model
└── projects/
    └── README.md                # 🎨 App development & deployment
```

**Three-Document Purpose**:

- **README.md** = Technical teams (setup, APIs, implementation)
- **copilot.md** = AI assistants (workflows, commands, quick reference)
- **BUSINESS.md** = Business stakeholders (strategy, revenue, value propositions)

## 🤝 Contributing

1. **Never duplicate code** - Add shared functionality to FireUX Core
2. **Keep apps minimal** - Only unique content and configurations
3. **Use modular approach** - Create focused modules like FireUX Jobs for specific features
4. **Use TypeScript** - Maintain type safety across modules
5. **Test in playground** - Validate components before production
6. **Follow naming** - Prefix components with `Fire*`
7. **Document thoroughly** - Maintain README, copilot, and BUSINESS docs

### Development Best Practices

- **Start minimal**: Build working versions first, optimize later
- **Test integration early**: Real app integration reveals design issues  
- **Avoid over-engineering**: Simple prop passing beats complex state management
- **Commit working features**: Don't commit half-finished implementations
- **Use semantic versioning**: Follow proper versioning for module releases

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
