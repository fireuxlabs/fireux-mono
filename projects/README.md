## Project scopes
- fireux: hub site (core only)
- cleanbox: cleaning company template/app (core + jobs)
- misebox: hospitality app (core + jobs + misebox)

See repo root CONTEXT.md for product strategy and docs/STRUCTURE_GUIDE.md for dev workflow.

Last updated: 2025-08-10
# � FireUX Projects: Ecosystem vs Tenant Architecture

This directory contains two distinct types of applications with fundamentally different business models and purposes.

## 🎯 **Core Concept: Ecosystem vs Tenant Applications**

### 🌍 **Ecosystem Applications** (Public Marketplaces)

**Purpose**: Global marketplaces where anyone can create profiles and discover services  
**Business Model**: Freemium → Premium tenant creation ($1000+ setup fee)

| Application  | URL                           | Theme Colors | Purpose                                           |
| ------------ | ----------------------------- | ------------ | ------------------------------------------------- |
| **MiseBox**  | https://misebox-78f9c.web.app | Green/Slate  | Global culinary marketplace - ALL chefs/suppliers |
| **CleanBox** | https://cleanbox.web.app      | Blue/Slate   | Global cleaning services marketplace              |
| **FireUX**   | https://fireux-2005.web.app   | Yellow/Zinc  | Global job marketplace                            |

**Key Features**:

- ✅ Open registration for anyone
- ✅ Global discovery (search ALL businesses)
- ✅ Lead generation: "Like this? Get your own app for $1000"
- ✅ SEO-optimized for maximum discoverability

### 🏪 **Tenant Applications** (Private Brands)

**Purpose**: White-label apps for specific businesses/franchises  
**Business Model**: $1000+ setup fee + monthly hosting

| Application    | URL                   | Business Type | Purpose                                   |
| -------------- | --------------------- | ------------- | ----------------------------------------- |
| **Niederhorn** | niederhorn.local:3009 | Restaurant    | ONLY Niederhorn's chefs/kitchens/services |

**Key Features**:

- 🔒 Closed/curated content (only business's services)
- 🎯 Brand-specific customization
- 📍 Location-focused (specific regions/franchises)
- 💼 Direct customer acquisition

## 🔄 **Customer Journey: Ecosystem → Tenant**

1. **Discovery** (misebox-app): User finds "Niederhorn chef" among ALL chefs
2. **Impression**: Quality/brand recognition builds
3. **Conversion CTA**: "Love Niederhorn? Get the full experience!"
4. **Retention** (niederhorn app): Exclusive menus, priority booking, loyalty

## 🏗️ **Technical Architecture**

### **Shared Foundation** (fireux-misebox package):

- ✅ Chef/Supplier profile components
- ✅ Booking systems, reviews, kitchen management
- ✅ Core functionality identical across all apps

### **Divergent Features**:

#### **Ecosystem Apps** (misebox-app):

```typescript
<AllChefsMap />           // Show ALL chefs globally
<CrossBrandSearch />      // Search across all brands
<LeadGeneration />        // "Get your own app" CTAs
```

#### **Tenant Apps** (niederhorn):

```typescript
<BrandedKitchenList />    // Only Niederhorn's locations
<FranchiseOpportunities />// Business expansion tools
<DirectBooking />         // Skip marketplace fees
```

## � **Content Strategy Examples**

### **Ecosystem Content** (misebox-app):

- `/chefs` → ALL chefs in ecosystem (thousands)
- `/kitchens` → ALL kitchens globally
- `/suppliers` → Compare 500+ suppliers
- "Trending kitchens this week"
- "Ready to scale? Get your own marketplace"

### **Tenant Content** (niederhorn):

- `/chefs` → ONLY Niederhorn's chefs
- `/mx-kitchens` → ONLY Niederhorn locations
- `/franchise` → Niederhorn expansion opportunities
- "The Niederhorn Experience"
- "Book your exclusive table now"

## 🎯 **Development Strategy**

### **Phase 1: Shared Foundation** ✅ (Current)

- Centralized Chef/Supplier components in fireux-misebox
- Identical functionality for development efficiency

### **Phase 2: Ecosystem Enhancement** 🔄 (Next)

- Add global discovery features to misebox-app
- Implement lead generation CTAs for tenant conversion
- Optimize ecosystem apps for SEO and organic traffic

### **Phase 3: Tenant Differentiation** 🔮 (Future)

- Brand-specific customization tools
- Franchise management features
- Custom page types (mx-kitchens, franchise-opportunities)

## 🚀 **Future Tenant Examples**

### **Potential Misebox Tenants**:

- `gordon-ramsay-kitchens` - Celebrity chef restaurant group
- `local-eats-berlin` - Berlin food tour company
- `corporate-catering-ltd` - B2B catering service

### **Potential Cleanbox Tenants**:

- `molly-maid-franchise` - Cleaning franchise app
- `luxury-home-services` - High-end residential cleaning

## 📈 **Revenue Model**

### **Ecosystem Apps** (Lead Generation):

- Freemium profile creation
- Premium listing features
- Advertising revenue
- **Tenant conversion**: "Get your own app for $1000+"

### **Tenant Apps** (High-Value Products):

- $1000+ setup fee per tenant
- Monthly hosting/maintenance fees
- Custom development charges
- White-label licensing

## �🚀 Quick Deployment

```bash
# Deploy all three apps at once
./deploy-all.sh

# Or individual deployment
cd cleanbox/cleanbox-app && pnpm build && pnpm exec firebase deploy
cd misebox/misebox-app && pnpm build && pnpm exec firebase deploy
cd fireux/fireux-app && pnpm build && pnpm exec firebase deploy
```

## 📚 Documentation

- [`projects.doc.md`](./projects.doc.md) - Detailed development and deployment guide
- [`../manuals/development.doc.md`](../manuals/development.doc.md) - Main development workflow
- [`../manuals/architecture.doc.md`](../manuals/architecture.doc.md) - System architecture overview
- [`misebox/misebox.doc.md`](./misebox/misebox.doc.md) - MiseBox culinary marketplace documentation

### 🚧 Active Development

**MiseBox Profile System Refactor**

- **Phase 1**: ✅ Complete - Unified profile architecture in fireux-core
- **Phase 2**: 🔄 In Progress - Integration of config-driven system into Chef/Supplier pages
- **Goal**: Scalable, maintainable profile listing and card system

## 🎨 Creating New Projects

```bash
# Copy existing project structure
cp -r fireux/fireux-app newproject/newproject-app

# Customize:
# 1. app.config.ts - Theme colors
# 2. firebase.json - Firebase project
# 3. pages/index.vue - Landing page
# 4. .env - Environment variables
```

---

For detailed deployment procedures, troubleshooting, and advanced configuration, see [`projects.doc.md`](./projects.doc.md).
