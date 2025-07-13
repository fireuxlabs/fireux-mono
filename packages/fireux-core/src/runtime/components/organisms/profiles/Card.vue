<template>
  <UCard :class="[`${profileType}-card`, 'profile-card']" @click="handleClick">
    <!-- Profile Header -->
    <div class="profile-header">
      <!-- Avatar -->
      <div class="avatar-container">
        <UAvatar
          v-if="profile[config.avatar_field]"
          :src="profile[config.avatar_field]"
          :alt="displayName"
          size="md"
        />
        <UAvatar
          v-else
          :text="getInitials(displayName)"
          size="md"
          color="primary"
        />
      </div>

      <!-- Profile Info -->
      <div class="profile-info">
        <h3 class="profile-name">{{ displayName }}</h3>
        <p v-if="subtitle" class="profile-subtitle">{{ subtitle }}</p>
        <p v-if="description" class="profile-description">{{ description }}</p>
      </div>
    </div>

    <!-- Profile Stats -->
    <div v-if="stats.length" class="profile-stats">
      <div v-for="stat in stats" :key="stat.key" class="stat-item">
        <UIcon :name="stat.icon" class="stat-icon" />
        <span class="stat-text">{{ stat.value }}</span>
      </div>
    </div>

    <!-- Primary Badges (e.g., specialties, categories) -->
    <div v-if="primaryBadges.length" class="profile-badges primary-badges">
      <div class="badges-label">{{ config.primary_badges.label }}:</div>
      <div class="badges-grid">
        <UBadge
          v-for="badge in primaryBadges.slice(0, 3)"
          :key="badge"
          :variant="config.primary_badges.variant || 'soft'"
          size="sm"
        >
          {{ badge }}
        </UBadge>
        <UBadge v-if="primaryBadges.length > 3" variant="outline" size="sm">
          +{{ primaryBadges.length - 3 }} more
        </UBadge>
      </div>
    </div>

    <!-- Secondary Badges (e.g., additional specialties) -->
    <div
      v-if="secondaryBadges.length && config.secondary_badges"
      class="profile-badges secondary-badges"
    >
      <div class="badges-label">{{ config.secondary_badges.label }}:</div>
      <div class="badges-grid">
        <UBadge
          v-for="badge in secondaryBadges.slice(0, 3)"
          :key="badge"
          :variant="config.secondary_badges.variant || 'outline'"
          size="sm"
        >
          {{ badge }}
        </UBadge>
        <UBadge v-if="secondaryBadges.length > 3" variant="outline" size="sm">
          +{{ secondaryBadges.length - 3 }} more
        </UBadge>
      </div>
    </div>

    <!-- Status Indicator -->
    <div
      v-if="statusDisplay"
      class="status-indicator"
      :class="statusDisplay.class"
    >
      <UIcon :name="statusDisplay.icon" :class="statusDisplay.iconClass" />
      <span :class="statusDisplay.textClass">{{ statusDisplay.text }}</span>
    </div>

    <!-- Location -->
    <div v-if="locationText" class="profile-location">
      <UIcon name="i-heroicons-map-pin" class="location-icon" />
      <span class="location-text">{{ locationText }}</span>
    </div>

    <!-- Custom Sections -->
    <div
      v-for="section in customSections"
      :key="section.key"
      :class="[`custom-section-${section.key}`, 'custom-section']"
    >
      <div v-if="section.label" class="section-label">{{ section.label }}:</div>
      <div class="section-content">
        <span v-for="item in section.items" :key="item" class="section-item">
          {{ item }}
        </span>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="profile-footer">
      <UButton
        v-for="action in actions"
        :key="action.key"
        :variant="action.variant || 'ghost'"
        size="sm"
        @click.stop="handleAction(action)"
      >
        {{ action.label }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ProfileConfig {
  // Basic display configuration
  name_field: string
  subtitle_field?: string
  description_field?: string
  avatar_field: string

  // Stats configuration
  stats: Array<{
    key: string
    field: string
    icon: string
    formatter?: string
    condition?: string
  }>

  // Badges configuration
  primary_badges: {
    field: string
    label: string
    variant?: string
    formatter?: string
  }

  secondary_badges?: {
    field: string
    label: string
    variant?: string
    formatter?: string
  }

  // Status configuration
  status?: {
    field: string
    mapping: Record<
      string,
      {
        text: string
        icon: string
        class: string
        iconClass: string
        textClass: string
      }
    >
  }

  // Location configuration
  location?: {
    city_field: string
    state_field: string
  }

  // Custom sections
  custom_sections?: Array<{
    key: string
    field: string
    label?: string
    formatter?: string
  }>

  // Actions configuration
  actions: Array<{
    key: string
    label: string
    variant?: string
    event: string
  }>
}

interface Props {
  profile: Record<string, any>
  config: ProfileConfig
  profileType: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [profile: Record<string, any>]
  action: [action: string, profile: Record<string, any>]
}>()

// Computed properties for display values
const displayName = computed(() => {
  return props.profile[props.config.name_field] || 'Unknown'
})

const subtitle = computed(() => {
  if (!props.config.subtitle_field) return null
  const value = props.profile[props.config.subtitle_field]
  return value ? formatValue(value, 'title') : null
})

const description = computed(() => {
  if (!props.config.description_field) return null
  return props.profile[props.config.description_field] || null
})

const stats = computed(() => {
  return props.config.stats
    .map((statConfig) => {
      const value = getNestedValue(props.profile, statConfig.field)
      if (!value) return null

      // Check condition if specified
      if (statConfig.condition) {
        const conditionValue = getNestedValue(
          props.profile,
          statConfig.condition
        )
        if (!conditionValue) return null
      }

      const formattedValue = statConfig.formatter
        ? formatValue(value, statConfig.formatter)
        : value

      return {
        key: statConfig.key,
        icon: statConfig.icon,
        value: formattedValue,
      }
    })
    .filter((stat): stat is NonNullable<typeof stat> => stat !== null)
})

const primaryBadges = computed(() => {
  const badges = getNestedValue(
    props.profile,
    props.config.primary_badges.field
  )
  if (!Array.isArray(badges)) return []

  return props.config.primary_badges.formatter
    ? badges.map((badge) =>
        formatValue(badge, props.config.primary_badges.formatter!)
      )
    : badges
})

const secondaryBadges = computed(() => {
  if (!props.config.secondary_badges) return []

  const badges = getNestedValue(
    props.profile,
    props.config.secondary_badges.field
  )
  if (!Array.isArray(badges)) return []

  return props.config.secondary_badges.formatter
    ? badges.map((badge) =>
        formatValue(badge, props.config.secondary_badges!.formatter!)
      )
    : badges
})

const statusDisplay = computed(() => {
  if (!props.config.status) return null

  const statusValue = getNestedValue(props.profile, props.config.status.field)
  if (!statusValue) return null

  const mapping = props.config.status.mapping[statusValue]
  return mapping || null
})

const locationText = computed(() => {
  if (!props.config.location) return null

  const city = getNestedValue(props.profile, props.config.location.city_field)
  const state = getNestedValue(props.profile, props.config.location.state_field)

  if (!city) return null
  return state ? `${city}, ${state}` : city
})

const customSections = computed(() => {
  if (!props.config.custom_sections) return []

  return props.config.custom_sections
    .map((sectionConfig) => {
      const items = getNestedValue(props.profile, sectionConfig.field)
      if (!Array.isArray(items) || !items.length) return null

      const formattedItems = sectionConfig.formatter
        ? items.map((item) => formatValue(item, sectionConfig.formatter!))
        : items

      return {
        key: sectionConfig.key,
        label: sectionConfig.label,
        items: formattedItems,
      }
    })
    .filter(
      (section): section is NonNullable<typeof section> => section !== null
    )
})

const actions = computed(() => {
  return props.config.actions || []
})

// Utility functions
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function formatValue(value: any, formatter: string): string {
  switch (formatter) {
    case 'title':
      return typeof value === 'string'
        ? value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
        : String(value)

    case 'currency':
      return typeof value === 'number' ? `$${value}` : String(value)

    case 'years':
      return typeof value === 'number' ? `${value} years` : String(value)

    case 'capitalize':
      return typeof value === 'string'
        ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        : String(value)

    case 'experience':
      if (Array.isArray(value)) {
        const totalYears = value.reduce((total, exp) => {
          const fromYear = parseInt(exp.from_year)
          const toYear = exp.to_year
            ? parseInt(exp.to_year)
            : new Date().getFullYear()
          return total + (toYear - fromYear)
        }, 0)
        return `${totalYears} years experience`
      }
      return String(value)

    case 'hourly_rate':
      return typeof value === 'number' ? `$${value}/hr` : String(value)

    case 'minimum_order':
      return typeof value === 'number' ? `$${value} min order` : String(value)

    default:
      return String(value)
  }
}

// Event handlers
function handleClick() {
  emit('click', props.profile)
}

function handleAction(action: { key: string; event: string }) {
  emit('action', action.event, props.profile)
}
</script>

<style scoped>
.profile-card {
  @apply cursor-pointer transition-all duration-200 hover:shadow-md;
}

.profile-header {
  @apply flex items-start gap-3 mb-4;
}

.avatar-container {
  @apply flex-shrink-0;
}

.profile-info {
  @apply flex-1 min-w-0;
}

.profile-name {
  @apply text-lg font-semibold text-gray-900 dark:text-white truncate;
}

.profile-subtitle {
  @apply text-sm font-medium text-gray-600 dark:text-gray-300 mt-1;
}

.profile-description {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2;
}

.profile-stats {
  @apply flex flex-wrap gap-3 mb-4;
}

.stat-item {
  @apply flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300;
}

.stat-icon {
  @apply w-4 h-4 text-gray-400;
}

.profile-badges {
  @apply mb-3;
}

.badges-label {
  @apply text-xs font-medium text-gray-500 dark:text-gray-400 mb-2;
}

.badges-grid {
  @apply flex flex-wrap gap-1.5;
}

.status-indicator {
  @apply flex items-center gap-2 mb-3 p-2 rounded-md;
}

.status-indicator.available {
  @apply bg-green-50 dark:bg-green-900/20;
}

.status-indicator.busy {
  @apply bg-yellow-50 dark:bg-yellow-900/20;
}

.status-indicator.unavailable {
  @apply bg-gray-50 dark:bg-gray-900/20;
}

.status-indicator .available-icon {
  @apply text-green-600 dark:text-green-400;
}

.status-indicator .available-text {
  @apply text-green-800 dark:text-green-300 text-sm font-medium;
}

.profile-location {
  @apply flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-3;
}

.location-icon {
  @apply w-4 h-4 text-gray-400;
}

.custom-section {
  @apply mb-3;
}

.section-label {
  @apply text-xs font-medium text-gray-500 dark:text-gray-400 mb-2;
}

.section-content {
  @apply flex flex-wrap gap-2;
}

.section-item {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.profile-footer {
  @apply flex justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700;
}

/* Profile type specific styles */
.chef-card {
  @apply border-l-4 border-l-orange-500;
}

.supplier-card {
  @apply border-l-4 border-l-blue-500;
}
</style>
