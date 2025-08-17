# 🎨 FireUX Theming Guide

## Overview

FireUX uses a two-step theming system that separates design tokens from implementation:

1. **Declare semantic colors** in `app.config.ts` using NuxtUI color names
2. **Define implementation colors** in `.env` using quoted hex values

## 🔄 Complete Theming Workflow

### Step 1: Choose NuxtUI Colors (`app.config.ts`)

```typescript
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet', // Semantic color name
      neutral: 'slate', // Neutral/secondary color name
    },
  },
})
```

### Step 2: Calculate Hex Values

Use the standard 500 shade (middle intensity) for each color:

| NuxtUI Color | Hex Value | Usage Example      |
| ------------ | --------- | ------------------ |
| `red`        | `#EF4444` | Emergency services |
| `blue`       | `#3B82F6` | Professional/trust |
| `green`      | `#22C55E` | Success/nature     |
| `yellow`     | `#EAB308` | Energy/warning     |
| `violet`     | `#8B5CF6` | Creative/modern    |
| `indigo`     | `#6366F1` | Deep/professional  |
| `slate`      | `#64748B` | Neutral/text       |
| `zinc`       | `#71717A` | Modern neutral     |

### Step 3: Set Environment Variables (`.env`)

**⚠️ CRITICAL: Hex values MUST be quoted to prevent `#` being interpreted as comments!**

```bash
# ✅ CORRECT - Quoted hex values
APP_PRIMARY_COLOR="#8B5CF6"
APP_NEUTRAL_COLOR="#64748B"

# ❌ WRONG - Unquoted hex values (treated as comments)
APP_PRIMARY_COLOR=#8B5CF6
APP_NEUTRAL_COLOR=#64748B
```

## 🎯 App Color Examples

### Current App Themes:

| App            | Primary (UI) | Primary (Hex) | Neutral (UI) | Neutral (Hex) |
| -------------- | ------------ | ------------- | ------------ | ------------- |
| **FireUX**     | `yellow`     | `"#EAB308"`   | `zinc`       | `"#71717A"`   |
| **CleanBox**   | `blue`       | `"#3B82F6"`   | `slate`      | `"#64748B"`   |
| **MiseBox**    | `green`      | `"#22C55E"`   | `slate`      | `"#64748B"`   |
| **Niederhorn** | `violet`     | `"#8B5CF6"`   | `zinc`       | `"#64748B"`   |

## 🔧 Implementation Details

### How It Works:

1. **Design Phase**: Designers choose semantic NuxtUI colors in `app.config.ts`
2. **Build Phase**: Developers calculate corresponding hex values
3. **Runtime Phase**: Environment variables provide hex values for theming APIs
4. **Client Phase**: Both systems work together for consistent theming

### Environment Variable Usage:

The quoted hex values are used by:

- Server-side theme generation APIs (`/api/app/theme`)
- Cross-app theme sharing in the ecosystem
- Build-time theme calculations
- Dynamic CSS custom property injection

## 🚨 Common Issues

### Problem: Colors Show as "Missing" in Environment Checker

**Cause**: Unquoted hex values - the `#` symbol starts a comment  
**Solution**: Always quote hex values: `APP_PRIMARY_COLOR="#8B5CF6"`

### Problem: Theme Not Applying

**Cause**: Mismatch between app.config.ts and .env colors  
**Solution**: Ensure semantic color in app.config maps to correct hex in .env

### Problem: Build Errors

**Cause**: Invalid color names or malformed hex values  
**Solution**: Use only valid NuxtUI color names and proper hex format

## 📋 Theming Checklist

When setting up app theming:

- [ ] Choose semantic colors in `app.config.ts`
- [ ] Calculate corresponding hex values (use 500 shade)
- [ ] Add quoted hex values to `.env` file
- [ ] Test environment checker shows colors as ✅ Set
- [ ] Verify theme applies correctly in browser
- [ ] Update documentation if adding new color schemes

## 🎨 Color Palette Suggestions

### Business Categories:

**Professional Services**: `blue` + `slate`  
**Creative Services**: `violet` + `zinc`  
**Food & Restaurants**: `green` + `slate`  
**Health & Wellness**: `emerald` + `slate`  
**Technology**: `indigo` + `zinc`  
**Finance**: `blue` + `slate`  
**Education**: `sky` + `slate`

---

> 💡 **Pro Tip**: Always test your theme in both light and dark modes to ensure accessibility and visual consistency across the FireUX ecosystem.
