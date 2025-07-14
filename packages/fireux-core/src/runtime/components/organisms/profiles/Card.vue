<template>
  <UCard class="profile-card" @click="handleClick">
    <!-- Profile Header -->
    <div class="profile-header">
      <!-- Avatar -->
      <div class="avatar-container">
        <UAvatar
          v-if="avatarUrl"
          :src="avatarUrl"
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

    <!-- Primary Info (specialties, categories, etc.) -->
    <div v-if="primaryTags && primaryTags.length" class="profile-tags">
      <UBadge
        v-for="tag in primaryTags.slice(0, 3)"
        :key="tag"
        variant="soft"
        size="sm"
      >
        {{ tag }}
      </UBadge>
      <UBadge v-if="primaryTags.length > 3" variant="outline" size="sm">
        +{{ primaryTags.length - 3 }} more
      </UBadge>
    </div>

    <!-- Profile Stats -->
    <div v-if="stats && stats.length" class="profile-stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-item">
        <UIcon :name="stat.icon" class="stat-icon" />
        <span class="stat-text">{{ stat.value }} {{ stat.label }}</span>
      </div>
    </div>

    <!-- Status (if available) -->
    <div v-if="status" class="profile-status" :class="statusClass">
      <UIcon :name="statusIcon" class="status-icon" />
      <span class="status-text">{{ status }}</span>
    </div>

    <!-- Location (if available) -->
    <div v-if="location" class="profile-location">
      <UIcon name="i-heroicons-map-pin" class="location-icon" />
      <span class="location-text">{{ location }}</span>
    </div>

    <!-- Footer Actions -->
    <div class="profile-footer">
      <UButton variant="ghost" size="sm" @click.stop="handleViewProfile">
        View Profile
      </UButton>
      <UButton variant="outline" size="sm" @click.stop="handleContact">
        Contact
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  profile: Record<string, any>
  profileType?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [profile: Record<string, any>]
  viewProfile: [profile: Record<string, any>]
  contact: [profile: Record<string, any>]
}>()

// Smart field detection based on common patterns
const displayName = computed(() => {
  return (
    props.profile.chef_name ||
    props.profile.business_name ||
    props.profile.display_name ||
    props.profile.name ||
    'Unknown'
  )
})

const avatarUrl = computed(() => {
  return props.profile.avatar || props.profile.image || null
})

const subtitle = computed(() => {
  return (
    props.profile.title ||
    props.profile.business_type ||
    props.profile.role ||
    null
  )
})

const description = computed(() => {
  return (
    props.profile.bio_short ||
    props.profile.bio ||
    props.profile.description ||
    null
  )
})

const primaryTags = computed(() => {
  return (
    props.profile.specialties ||
    props.profile.product_categories ||
    props.profile.skills ||
    props.profile.categories ||
    []
  )
})

const status = computed(() => {
  if (props.profile.employment_status) {
    return formatStatus(props.profile.employment_status)
  }
  if (props.profile.status) {
    return formatStatus(props.profile.status)
  }
  return null
})

const statusClass = computed(() => {
  const statusValue = props.profile.employment_status || props.profile.status
  if (!statusValue) return ''

  if (statusValue === 'available') return 'status-available'
  if (statusValue === 'employed' || statusValue === 'busy') return 'status-busy'
  return 'status-inactive'
})

const statusIcon = computed(() => {
  const statusValue = props.profile.employment_status || props.profile.status
  if (!statusValue) return 'i-heroicons-question-mark-circle'

  if (statusValue === 'available') return 'i-heroicons-check-circle'
  if (statusValue === 'employed' || statusValue === 'busy')
    return 'i-heroicons-clock'
  return 'i-heroicons-x-circle'
})

const location = computed(() => {
  // Try different location formats
  if (props.profile.business_address) {
    const addr = props.profile.business_address
    return `${addr.city}, ${addr.state}`
  }

  if (props.profile.location) {
    if (typeof props.profile.location === 'string') {
      return props.profile.location
    }
    if (props.profile.location.city) {
      return `${props.profile.location.city}, ${props.profile.location.state || ''}`
    }
  }

  if (props.profile.city) {
    return `${props.profile.city}, ${props.profile.state || ''}`
  }

  return null
})

const stats = computed(() => {
  const statsArray = []

  // Chef stats
  if (props.profile.total_recipes) {
    statsArray.push({
      label: 'recipes',
      value: props.profile.total_recipes,
      icon: 'i-heroicons-book-open',
    })
  }
  if (props.profile.total_followers) {
    statsArray.push({
      label: 'followers',
      value: formatNumber(props.profile.total_followers),
      icon: 'i-heroicons-users',
    })
  }

  // Professional stats
  if (props.profile.jobs_completed) {
    statsArray.push({
      label: 'jobs completed',
      value: props.profile.jobs_completed,
      icon: 'i-heroicons-check-circle',
    })
  }
  if (props.profile.years_experience) {
    statsArray.push({
      label: 'years experience',
      value: props.profile.years_experience,
      icon: 'i-heroicons-academic-cap',
    })
  }

  // Employer stats
  if (props.profile.worker_base) {
    statsArray.push({
      label: 'employees',
      value: props.profile.worker_base,
      icon: 'i-heroicons-user-group',
    })
  }
  if (props.profile.years_established) {
    statsArray.push({
      label: 'years established',
      value: props.profile.years_established,
      icon: 'i-heroicons-building-office',
    })
  }

  // Supplier stats
  if (props.profile.total_items) {
    statsArray.push({
      label: 'items',
      value: props.profile.total_items,
      icon: 'i-heroicons-cube',
    })
  }
  if (props.profile.total_connections) {
    statsArray.push({
      label: 'connections',
      value: props.profile.total_connections,
      icon: 'i-heroicons-link',
    })
  }

  return statsArray.slice(0, 3) // Limit to 3 stats max
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

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// Event handlers
function handleClick() {
  emit('click', props.profile)
}

function handleViewProfile() {
  emit('viewProfile', props.profile)
}

function handleContact() {
  emit('contact', props.profile)
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

.profile-tags {
  @apply flex flex-wrap gap-1.5 mb-4;
}

.profile-status {
  @apply flex items-center gap-2 mb-3 p-2 rounded-md text-sm font-medium;
}

.status-available {
  @apply bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300;
}

.status-busy {
  @apply bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300;
}

.status-inactive {
  @apply bg-gray-50 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300;
}

.status-icon {
  @apply w-4 h-4;
}

.profile-location {
  @apply flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-4;
}

.location-icon {
  @apply w-4 h-4 text-gray-400;
}

.profile-footer {
  @apply flex justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700;
}
</style>
