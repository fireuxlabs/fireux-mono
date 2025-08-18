# FireUX Styling System - Semantic Classes

## Core Principle: Semantic CSS Classes Only

FireUX uses **semantic CSS classes** that describe the component's purpose and structure, NOT utility classes or inline styles.

## ❌ What We DON'T Use
- Utility classes: `class="flex items-center gap-4"`
- Inline styles: `style="display: flex; gap: 16px;"`
- Arbitrary values: `class="p-[16px]"`

## ✅ What We DO Use
- Semantic classes: `class="cell"`, `class="pill"`, `class="profile"`
- Descriptive structure: `class="cell-header"`, `class="cell-content"`
- Domain-specific: `class="chef-cell"`, `class="employer-pill"`

## Component Structure Patterns

### Pills (.pill)
```vue
<UCard class="pill">
  <div class="pill-content">
    <UAvatar />
    <div class="pill-info">
      <div class="pill-title">{{ name }}</div>
      <div class="pill-subtitle">{{ type }}</div>
    </div>
    <UBadge />
  </div>
</UCard>
```

### Cells (.cell)
```vue
<UCard class="cell">
  <div class="cell-header">
    <UAvatar />
    <div class="cell-content">
      <div class="cell-title-row">
        <h3 class="cell-title">{{ name }}</h3>
        <div class="cell-badges">
          <UBadge />
        </div>
      </div>
      <p class="cell-subtitle">{{ description }}</p>
      <div class="cell-tags">
        <UBadge />
      </div>
    </div>
  </div>
</UCard>
```

### Profiles (.profile)
```vue
<UCard class="profile">
  <div class="profile-header">
    <UAvatar />
    <div class="profile-info">
      <h3 class="profile-name">{{ name }}</h3>
      <p class="profile-subtitle">{{ type }}</p>
      <div class="profile-meta">{{ metadata }}</div>
    </div>
  </div>
  
  <p class="profile-bio">{{ bio }}</p>
  
  <div class="profile-section">
    <h4 class="section-title">{{ category }}</h4>
    <div class="profile-tags">
      <UBadge class="profile-tag" />
    </div>
  </div>
</UCard>
```

## Domain-Specific Extensions

Components can add domain-specific classes alongside base classes:

```vue
<!-- Core User -->
<UCard class="cell core-cell">

<!-- App User -->
<UCard class="cell app-cell">

<!-- Chef Profile -->
<UCard class="profile chef-profile">

<!-- Job Employer -->
<UCard class="cell employer-cell">
```

## App-Specific Icons

For app icons, use semantic classes with dynamic styling:

```vue
<div class="app-icon" :style="{ backgroundColor: app?.theme?.primary }">
  <UIcon :name="getAppIcon(app?.id)" />
</div>
```

## Why Semantic Classes?

1. **Consistent Structure**: All components follow the same semantic pattern
2. **Easy Maintenance**: Changes to `.cell` affect all cell components
3. **Clear Intent**: Class names describe what the element IS, not how it looks
4. **Scalable**: New components follow established patterns
5. **Theme-able**: Easy to apply different themes across domains

## Implementation Rule

**ALWAYS use semantic classes. NEVER use utility classes or inline styles.**

This ensures consistency across the entire FireUX ecosystem and makes components predictable and maintainable.
