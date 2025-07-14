<template>
  <div class="profile-list">
    <!-- Header -->
    <div v-if="title" class="list-header">
      <h2 class="list-title">{{ title }}</h2>
      <p v-if="subtitle" class="list-subtitle">{{ subtitle }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-grid">
        <USkeleton v-for="n in 6" :key="n" class="loading-card" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!profiles.length" class="empty-state">
      <UIcon name="i-heroicons-users" class="empty-icon" />
      <h3 class="empty-title">No {{ profileType || 'profiles' }} found</h3>
      <p class="empty-text">
        {{ emptyMessage || `Try adjusting your search criteria.` }}
      </p>
    </div>

    <!-- Profiles Grid -->
    <div v-else class="profiles-grid">
      <Card
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        :profile-type="profileType"
        @click="handleProfileClick"
        @viewProfile="handleViewProfile"
        @contact="handleContact"
      />
    </div>

    <!-- Load More (if needed) -->
    <div v-if="showLoadMore" class="load-more">
      <UButton
        variant="outline"
        size="lg"
        :loading="loadingMore"
        @click="handleLoadMore"
      >
        Load More {{ profileType || 'Profiles' }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  profiles: Record<string, any>[]
  profileType?: string
  title?: string
  subtitle?: string
  loading?: boolean
  loadingMore?: boolean
  showLoadMore?: boolean
  emptyMessage?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  profileClick: [profile: Record<string, any>]
  viewProfile: [profile: Record<string, any>]
  contact: [profile: Record<string, any>]
  loadMore: []
}>()

// Event handlers
function handleProfileClick(profile: Record<string, any>) {
  emit('profileClick', profile)
}

function handleViewProfile(profile: Record<string, any>) {
  emit('viewProfile', profile)
}

function handleContact(profile: Record<string, any>) {
  emit('contact', profile)
}

function handleLoadMore() {
  emit('loadMore')
}
</script>

<style scoped>
.profile-list {
  @apply w-full;
}

.list-header {
  @apply mb-6;
}

.list-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
}

.list-subtitle {
  @apply text-gray-600 dark:text-gray-300;
}

.loading-state {
  @apply w-full;
}

.loading-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.loading-card {
  @apply h-48 rounded-lg;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply w-16 h-16 mx-auto text-gray-400 mb-4;
}

.empty-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-2;
}

.empty-text {
  @apply text-gray-600 dark:text-gray-300;
}

.profiles-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.load-more {
  @apply flex justify-center mt-8;
}
</style>
