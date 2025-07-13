<template>
  <div class="profile-list-container">
    <!-- Header -->
    <div class="profile-list-header">
      <h1 class="profile-list-title">{{ config.title }}</h1>
      <p v-if="config.description" class="profile-list-description">
        {{ config.description }}
      </p>
    </div>

    <!-- Filters -->
    <div class="profile-list-filters">
      <component
        :is="config.filtersComponent"
        v-if="config.filtersComponent"
        v-model="activeFilters"
        @filter-change="handleFilterChange"
      />
    </div>

    <!-- Results Summary -->
    <div class="profile-list-summary">
      <p class="results-count">
        {{ filteredProfiles.length }} {{ config.profileType
        }}{{ filteredProfiles.length !== 1 ? 's' : '' }} found
      </p>
      <UButton
        v-if="Object.keys(activeFilters).length > 0"
        variant="ghost"
        size="sm"
        @click="clearFilters"
      >
        Clear Filters
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="profile-list-loading">
      <div class="loading-content">
        <UIcon :name="config.loadingIcon" class="loading-icon" />
        <p>Loading {{ config.profileType.toLowerCase() }}s...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="profile-list-error">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="soft"
        title="Error Loading Profiles"
        description="An error occurred while loading profiles. Please try again."
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredProfiles.length === 0 && !pending"
      class="profile-list-empty"
    >
      <div class="empty-content">
        <UIcon :name="config.emptyIcon" class="empty-icon" />
        <h3 class="empty-title">No {{ config.profileType }}s Found</h3>
        <p class="empty-description">
          {{
            Object.keys(activeFilters).length > 0
              ? 'Try adjusting your filters to see more results.'
              : config.emptyMessage
          }}
        </p>
      </div>
    </div>

    <!-- Profile Grid -->
    <div v-else class="profile-list-grid">
      <ProfileCard
        v-for="profile in filteredProfiles"
        :key="profile.id"
        :profile="profile"
        :config="config.cardConfig"
        :profile-type="config.profileType.toLowerCase()"
        @click="handleProfileClick"
        @action="handleProfileAction"
      />
    </div>

    <!-- Load More Button -->
    <div v-if="hasMore && !pending" class="profile-list-load-more">
      <UButton
        variant="outline"
        size="lg"
        @click="loadMore"
        :loading="loadingMore"
      >
        Load More {{ config.profileType }}s
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfileCard from '#fireux-core/runtime/components/organisms/profiles/Card.vue'
import type { ProfileConfig } from '#fireux-core/runtime/components/organisms/profiles/Card.vue'

interface ProfileListConfig {
  title: string
  description?: string
  profileType: string
  cardConfig: ProfileConfig
  filtersComponent?: string
  profileProp: string
  loadingIcon: string
  emptyIcon: string
  emptyMessage: string
  fetchFunction: string
  filterFunction?: (profiles: any[], filters: Record<string, any>) => any[]
  routeBasePath: string
}

const props = defineProps<{
  config: ProfileListConfig
}>()

// Reactive data
const activeFilters = ref({})
const loadingMore = ref(false)

// Get the fetch function from composables
const fetchFunction = computed(() => {
  // Handle specific profile types based on config
  const composableName = props.config.fetchFunction

  if (composableName === 'useChefs') {
    // Use misebox-specific chef composables
    const { suppliers: chefs } = useSuppliers() // This will be the chefs collection
    return {
      data: chefs,
      pending: ref(false),
      error: ref(null),
      refresh: () => {},
    }
  } else if (composableName === 'useSuppliers') {
    // Use misebox-specific supplier composables
    const { suppliers } = useSuppliers()
    return {
      data: suppliers,
      pending: ref(false),
      error: ref(null),
      refresh: () => {},
    }
  }

  // Fallback - this would need to be implemented if using generic profiles
  return {
    data: ref([]),
    pending: ref(false),
    error: ref(null),
    refresh: () => {},
  }
})

// Use the fetch function
const { data: profiles, pending, error, refresh } = await fetchFunction.value

// Computed filtered profiles
const filteredProfiles = computed(() => {
  if (!profiles.value) return []

  // If custom filter function is provided, use it
  if (props.config.filterFunction) {
    return props.config.filterFunction(profiles.value, activeFilters.value)
  }

  // Default filtering logic
  return applyDefaultFilters(profiles.value, activeFilters.value)
})

// Pagination state
const hasMore = computed(() => {
  // This would be determined by your pagination logic
  // For now, assume no pagination
  return false
})

// Methods
function handleFilterChange(filters: Record<string, any>) {
  activeFilters.value = filters
}

function clearFilters() {
  activeFilters.value = {}
}

function handleProfileClick(profile: any) {
  // Navigate to profile detail page
  navigateTo(`${props.config.routeBasePath}/${profile.id}`)
}

async function loadMore() {
  loadingMore.value = true
  // Implement pagination loading
  // This would depend on your pagination strategy
  loadingMore.value = false
}

function applyDefaultFilters(profiles: any[], filters: Record<string, any>) {
  let filtered = [...profiles]

  // Apply text search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(
      (profile) =>
        profile.name?.toLowerCase().includes(searchTerm) ||
        profile.title?.toLowerCase().includes(searchTerm) ||
        profile.bio_short?.toLowerCase().includes(searchTerm) ||
        profile.skills?.some((skill: string) =>
          skill.toLowerCase().includes(searchTerm)
        )
    )
  }

  // Apply location filter
  if (filters.location) {
    filtered = filtered.filter(
      (profile) =>
        profile.address?.city
          ?.toLowerCase()
          .includes(filters.location.toLowerCase()) ||
        profile.address?.state
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
    )
  }

  // Apply experience level filter
  if (filters.experienceLevel) {
    filtered = filtered.filter((profile) => {
      // This would depend on how experience level is stored
      // For now, use years of experience or experience count
      const experienceYears =
        profile.experience_years || profile.kitchen_experience?.length || 0

      switch (filters.experienceLevel) {
        case 'entry':
          return experienceYears <= 2
        case 'mid':
          return experienceYears > 2 && experienceYears <= 5
        case 'senior':
          return experienceYears > 5
        default:
          return true
      }
    })
  }

  // Apply skills filter
  if (filters.skills && filters.skills.length > 0) {
    filtered = filtered.filter((profile) =>
      profile.skills?.some((skill: string) => filters.skills.includes(skill))
    )
  }

  // Apply availability filter
  if (filters.availability) {
    filtered = filtered.filter(
      (profile) => profile.availability === filters.availability
    )
  }

  return filtered
}
</script>

<style scoped>
.profile-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

.profile-list-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.profile-list-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ui-text);
  margin: 0 0 var(--space-2) 0;
}

.profile-list-description {
  font-size: 1.125rem;
  color: var(--ui-text-muted);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.profile-list-filters {
  margin-bottom: var(--space-6);
}

.profile-list-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--ui-bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--ui-border);
}

.results-count {
  font-weight: 500;
  color: var(--ui-text);
  margin: 0;
}

.profile-list-loading,
.profile-list-error,
.profile-list-empty {
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.loading-content,
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.loading-icon,
.empty-icon {
  width: var(--space-12);
  height: var(--space-12);
  color: var(--ui-text-muted);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.empty-description {
  color: var(--ui-text-muted);
  margin: 0;
  max-width: 400px;
}

.profile-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.profile-list-load-more {
  display: flex;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .profile-list-container {
    padding: var(--space-4);
  }

  .profile-list-title {
    font-size: 1.5rem;
  }

  .profile-list-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .profile-list-summary {
    flex-direction: column;
    gap: var(--space-2);
    align-items: stretch;
    text-align: center;
  }
}
</style>
