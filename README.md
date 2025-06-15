# 🔥 FireUX Ecosystem

_Modern Nuxt 3 monorepo powering the next generation of service business platforms_

## 🚀 Quick Start

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

**99% Shared, 1% Unique** - Three production apps powered by one core module:

- **`packages/fireux-core/`** - Shared Nuxt 3 module (200+ components, pages, composables)
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
├── packages/fireux-core/    # Shared Nuxt 3 module
│   ├── src/runtime/         # 200+ components, pages, layouts
│   ├── src/module.ts        # Module configuration
│   └── src/*-config.ts      # Auto-import configurations
├── projects/                # Production applications
│   ├── fireux/fireux-app/   # Main company app (yellow)
│   ├── cleanbox/cleanbox-app/ # Cleaning platform (green)
│   └── misebox/misebox-app/   # Culinary platform (blue)
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

### App-Specific

Each app inherits all shared functionality but customizes:

- Landing page (`pages/index.vue`)
- Theme colors (`app.config.ts`)
- Firebase configuration
- Domain-specific content

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
**copilot.md** - AI assistant development workflows and fast reference  
**BUSINESS.md** - Business model, value propositions, and strategic context

### Documentation Hierarchy

### Documentation Structure Overview

```
fireux/
├── README.md                    # 🏠 Technical overview & implementation
├── copilot.md                   # 🤖 AI workflows & quick reference
├── BUSINESS.md                  # 💼 Business strategy & value props
├── packages/
│   ├── README.md                # 📦 Package architecture & development
│   ├── copilot.md               # 🛠️ Module development workflows
│   ├── BUSINESS.md              # 💰 Technical foundation business value
│   └── fireux-core/
│       ├── README.md            # 🎯 Core API & feature documentation
│       ├── copilot.md           # ⚙️ Internal development guide
│       └── BUSINESS.md          # 💎 Core module revenue impact
└── projects/
    ├── README.md                # 🎨 App development & deployment
    ├── copilot.md               # 🚀 App development workflows
    └── BUSINESS.md              # 🏢 Three-platform business validation
```

**Three-Document Purpose**:

- **README.md** = Technical teams (setup, APIs, implementation)
- **copilot.md** = AI assistants (workflows, commands, quick reference)
- **BUSINESS.md** = Business stakeholders (strategy, revenue, value propositions)

## 🤝 Contributing

1. **Never duplicate code** - Add shared functionality to FireUX Core
2. **Keep apps minimal** - Only unique content and configurations
3. **Use TypeScript** - Maintain type safety across modules
4. **Test in playground** - Validate components before production
5. **Follow naming** - Prefix components with `Fire*`

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
