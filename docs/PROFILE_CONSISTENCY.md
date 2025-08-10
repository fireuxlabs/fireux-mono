## Profile Component Consistency Template

### **Unified Structure (All Domains):**

```vue
<template>
  <UCard class="profile-cell {domain}-cell">
    <!-- HEADER: Avatar + Core Info (identical across all) -->
    <div class="profile-header">
      <UAvatar size="lg" />
      <div class="profile-info">
        <h4 class="profile-name">{{ name }}</h4>
        <p class="profile-subtitle">{{ type/title }}</p>
        <div class="profile-location">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ location }}</span>
        </div>
        <div class="profile-meta">{{ years/established }}</div>
      </div>
    </div>

    <!-- BIO: Long description (identical across all) -->
    <p class="profile-bio">{{ bio_long || bio_short }}</p>

    <!-- TAGS: Primary specialties (identical pattern) -->
    <div class="profile-tags">
      <span class="profile-tag">{{ specialty }}</span>
      <span class="profile-tag-more">+N more</span>
    </div>

    <!-- SECTION: One additional category (minimal difference) -->
    <div class="profile-section">
      <strong class="section-label">{Category}:</strong>
      <span class="profile-tag">{{ item }}</span>
    </div>

    <!-- STATS: 3 metrics (same pattern, different data) -->
    <div class="profile-stats">
      <div class="profile-stat">
        <UIcon name="icon" />
        <span>{{ metric }}</span>
      </div>
    </div>
  </UCard>
</template>
```

### **Progressive Enhancement Rules:**
- **Pill**: Header only (name + 1 thing)
- **Cell**: Header + Bio + Tags (3 sections)
- **Profile**: Header + Bio + Tags + Section + Stats (5 sections)

### **Consistency Goal:**
Same structure, same classes, same layout - just different data sources. No creative differences.
