<template>
  <div v-if="supplier" class="profile-display-card">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="supplier.avatarUrl"
          :alt="supplier.business_name"
          size="xl"
          :text="getInitials(supplier.business_name)"
        />
      </div>
      <div class="profile-info-section">
        <h1 class="profile-name">
          {{ supplier.business_name }}
        </h1>
        <p v-if="supplier.title" class="profile-subtitle">
          {{ supplier.title }}
        </p>
        <p v-if="supplier.email" class="profile-contact">
          <UIcon name="i-heroicons-envelope" />
          {{ supplier.email }}
        </p>
      </div>
    </div>

    <!-- Bio Section -->
    <div
      v-if="supplier.bio_short || supplier.bio_long"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">About</h3>
      <p class="profile-content-text">
        {{ supplier.bio_long || supplier.bio_short }}
      </p>
    </div>

    <!-- Specialties Section -->
    <div
      v-if="supplier.specialties && supplier.specialties.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Specialties</h3>
      <div class="specialties-grid">
        <UBadge
          v-for="specialty in supplier.specialties"
          :key="specialty"
          variant="soft"
          size="md"
        >
          {{ specialty }}
        </UBadge>
      </div>
    </div>

    <!-- Stats Section -->
    <div v-if="hasStats" class="profile-content-section">
      <h3 class="profile-content-title">Stats</h3>
      <div class="stats-grid">
        <div v-if="supplier.total_items" class="stat-item">
          <UIcon name="i-lucide-package" class="stat-icon" />
          <span class="stat-value">{{ supplier.total_items }}</span>
          <span class="stat-label">Items</span>
        </div>
        <div v-if="supplier.total_connections" class="stat-item">
          <UIcon name="i-lucide-link" class="stat-icon" />
          <span class="stat-value">{{
            formatNumber(supplier.total_connections)
          }}</span>
          <span class="stat-label">Connections</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

// Computed properties
const hasStats = computed(() => {
  return supplier.value?.total_items || supplier.value?.total_connections
})

// Helper functions
function getInitials(name) {
  if (!name) return 'S'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatNumber(num) {
  if (!num) return '0'
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.profile-display-card {
  @apply max-w-4xl mx-auto space-y-8;
}

.profile-header {
  @apply flex flex-col sm:flex-row gap-6 items-start;
}

.profile-avatar-section {
  @apply flex-shrink-0;
}

.profile-info-section {
  @apply flex-1 space-y-2;
}

.profile-name {
  @apply text-3xl font-bold text-gray-900;
}

.profile-subtitle {
  @apply text-xl text-gray-600;
}

.profile-contact {
  @apply flex items-center gap-2 text-gray-500;
}

.profile-content-section {
  @apply space-y-4;
}

.profile-content-title {
  @apply text-xl font-semibold text-gray-900;
}

.profile-content-text {
  @apply text-gray-700 leading-relaxed;
}

.specialties-grid {
  @apply flex flex-wrap gap-2;
}

.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-item {
  @apply flex flex-col items-center p-4 bg-gray-50 rounded-lg;
}

.stat-icon {
  @apply w-6 h-6 text-gray-500 mb-2;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}
</style>
