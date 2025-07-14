<template>
  <UCard>
    <div class="chef-profile-header">
      <UAvatar
        :src="chef?.avatarUrl"
        :alt="chef?.chef_name"
        size="xl"
        :text="getInitials(chef?.chef_name)"
      />
      <div class="chef-info">
        <h2 class="chef-name">{{ chef?.chef_name || 'Chef' }}</h2>
        <p v-if="chef?.title" class="chef-title">
          {{ chef.title }}
        </p>
      </div>
    </div>

    <div v-if="chef?.bio_long || chef?.bio_short" class="chef-about">
      <h3 class="section-title">About</h3>
      <p class="section-content">
        {{ chef.bio_long || chef.bio_short }}
      </p>
    </div>

    <div v-if="hasSpecialties" class="chef-specialties">
      <h3 class="section-title">Specialties</h3>
      <div class="specialties-grid">
        <UBadge
          v-for="specialty in chef.specialties"
          :key="specialty"
          variant="soft"
        >
          {{ specialty }}
        </UBadge>
      </div>
    </div>

    <!-- Location - Remove since Chef model doesn't have location -->
    <!-- Future: If needed, location data would need to be added to Chef model -->

    <div class="chef-stats">
      <h3 class="section-title">Stats</h3>
      <div class="stats-grid">
        <div v-if="chef?.total_recipes" class="stat-card">
          <UIcon name="i-lucide-book-open" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ chef.total_recipes }}</span>
            <span class="stat-label">Recipes</span>
          </div>
        </div>
        <div v-if="chef?.total_followers" class="stat-card">
          <UIcon name="i-lucide-users" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{
              formatNumber(chef.total_followers)
            }}</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../../models/Chef.model'

interface Props {
  chef: Chef
}

const props = defineProps<Props>()

const hasSpecialties = computed(() => {
  return props.chef?.specialties && props.chef.specialties.length > 0
})

function getInitials(name?: string): string {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
</script>

<style scoped>
.chef-profile-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chef-info {
  flex: 1;
}

.chef-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.chef-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #3b82f6;
  margin-top: 0.25rem;
}

.chef-about,
.chef-specialties,
.chef-location,
.chef-stats {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
}

.section-content {
  color: #374151;
  line-height: 1.625;
}

.specialties-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.location-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
}

.location-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.stat-icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.875rem;
  color: #4b5563;
}
</style>
