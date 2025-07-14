<template>  <div v-if="chef" class="profile-display-card">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="chef.avatarUrl"
          :alt="chef.displayName"
          size="xl"
          :text="getInitials(chef.displayName)"
        />
      </div>
      <div class="profile-info-section">
        <h1 class="profile-name">
          {{ chef.displayName }}
        </h1>
        <p v-if="chef.title" class="profile-subtitle">
          {{ chef.title }}
        </p>
        <p v-if="chef.email" class="profile-contact">
          <UIcon name="i-heroicons-envelope" />
          {{ chef.email }}
        </p>
      </div>
    </div>

    <!-- Bio Section -->
    <div v-if="chef.bio_short || chef.bio_long" class="profile-content-section">
      <h3 class="profile-content-title">About</h3>
      <p class="profile-content-text">
        {{ chef.bio_long || chef.bio_short }}
      </p>
    </div>

    <!-- Specialties Section -->
    <div
      v-if="chef.specialties && chef.specialties.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Specialties</h3>
      <div class="specialties-grid">
        <UBadge
          v-for="specialty in chef.specialties"
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
        <div v-if="chef.total_recipes" class="stat-item">
          <UIcon name="i-lucide-book-open" class="stat-icon" />
          <span class="stat-value">{{ chef.total_recipes }}</span>
          <span class="stat-label">Recipes</span>
        </div>
        <div v-if="chef.total_followers" class="stat-item">
          <UIcon name="i-lucide-users" class="stat-icon" />
          <span class="stat-value">{{
            formatNumber(chef.total_followers)
          }}</span>
          <span class="stat-label">Followers</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

// Computed properties
const hasStats = computed(() => {
  return props.chef?.total_recipes || props.chef?.total_followers
})

// Helper functions
function getInitials(name) {
  if (!name) return 'C'
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
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
}

@media (min-width: 640px) {
  .profile-header {
    flex-direction: row;
  }
}

.profile-avatar-section {
  flex-shrink: 0;
}

.profile-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-name {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  color: rgb(17 24 39);
}

.profile-subtitle {
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: rgb(75 85 99);
}

.profile-contact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(107 114 128);
}

.profile-content-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-content-title {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

.profile-content-text {
  color: rgb(55 65 81);
  line-height: 1.625;
}

.specialties-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: rgb(249 250 251);
  border-radius: 0.5rem;
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(107 114 128);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  color: rgb(17 24 39);
}

.stat-label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(107 114 128);
}
</style>
