<template>
  <UCard class="chef-card" @click="handleClick">
    <!-- Chef Header -->
    <div class="chef-header">
      <!-- Avatar -->
      <div class="avatar-container">
        <UAvatar
          v-if="chef.avatar"
          :src="chef.avatar"
          :alt="chefName"
          size="md"
        />
        <UAvatar
          v-else
          :text="getInitials(chefName)"
          size="md"
          color="primary"
        />
      </div>

      <!-- Chef Info -->
      <div class="chef-info">
        <h3 class="chef-name">{{ chefName }}</h3>
        <p v-if="chef.title" class="chef-title">{{ chef.title }}</p>
        <p v-if="chef.bio_short" class="chef-bio">{{ chef.bio_short }}</p>
      </div>
    </div>

    <!-- Chef Stats -->
    <div class="chef-stats">
      <div v-if="experienceYears" class="stat-item">
        <UIcon name="i-heroicons-clock" class="stat-icon" />
        <span class="stat-text">{{ experienceYears }} experience</span>
      </div>

      <div v-if="chef.employment_status" class="stat-item">
        <UIcon name="i-heroicons-briefcase" class="stat-icon" />
        <span class="stat-text">{{
          formatEmploymentStatus(chef.employment_status)
        }}</span>
      </div>

      <div v-if="hourlyRateText" class="stat-item">
        <UIcon name="i-heroicons-currency-dollar" class="stat-icon" />
        <span class="stat-text">{{ hourlyRateText }}</span>
      </div>
    </div>

    <!-- Specialties -->
    <div v-if="chef.specialties?.length" class="chef-specialties">
      <div class="specialties-label">Specialties:</div>
      <div class="specialties-grid">
        <UBadge
          v-for="specialty in chef.specialties.slice(0, 3)"
          :key="specialty"
          variant="soft"
          size="sm"
        >
          {{ specialty }}
        </UBadge>
        <UBadge v-if="chef.specialties.length > 3" variant="outline" size="sm">
          +{{ chef.specialties.length - 3 }} more
        </UBadge>
      </div>
    </div>

    <!-- Availability Status -->
    <div
      v-if="chef.employment_status === 'available'"
      class="availability-status"
    >
      <UIcon name="i-heroicons-check-circle" class="available-icon" />
      <span class="available-text">Available for hire</span>
    </div>

    <!-- Location -->
    <div v-if="chef.address?.city" class="chef-location">
      <UIcon name="i-heroicons-map-pin" class="location-icon" />
      <span class="location-text"
        >{{ chef.address.city }}, {{ chef.address.state }}</span
      >
    </div>

    <!-- Footer Actions -->
    <div class="chef-footer">
      <UButton variant="ghost" size="sm" @click.stop="handleContact">
        Contact Chef
      </UButton>
      <UButton variant="outline" size="sm" @click.stop="handleViewProfile">
        View Profile
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Chef } from '../models/Chef.model'

interface Props {
  chef: Chef
}

const props = defineProps<Props>()

// Computed properties
const chefName = computed(() => {
  return props.chef.chef_name || 'Chef'
})

const experienceYears = computed(() => {
  if (!props.chef.kitchen_experience?.length) return null

  const totalYears = props.chef.kitchen_experience.reduce(
    (total: number, exp: any) => {
      const startYear = parseInt(exp.from_year)
      const endYear = exp.ongoing
        ? new Date().getFullYear()
        : parseInt(exp.to_year || exp.from_year)
      return total + (endYear - startYear)
    },
    0
  )

  return totalYears === 1 ? '1 year' : `${totalYears} years`
})

const hourlyRateText = computed(() => {
  const min = props.chef.hourly_rate_min
  const max = props.chef.hourly_rate_max
  const currency = props.chef.currency || 'USD'
  const symbol = currency === 'USD' ? '$' : `${currency} `

  if (min && max) {
    return `${symbol}${min}-${symbol}${max}/hr`
  } else if (min) {
    return `From ${symbol}${min}/hr`
  } else if (max) {
    return `Up to ${symbol}${max}/hr`
  }
  return null
})

// Methods
function getInitials(name: string): string {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatEmploymentStatus(status: string): string {
  switch (status) {
    case 'available':
      return 'Available'
    case 'employed':
      return 'Employed'
    case 'freelance':
      return 'Freelance'
    case 'not_available':
      return 'Unavailable'
    default:
      return 'Unknown'
  }
}

function handleClick() {
  navigateTo(`/chefs/${props.chef.id}`)
}

function handleContact() {
  // Implement contact functionality
  console.log('Contact chef:', props.chef.id)
}

function handleViewProfile() {
  navigateTo(`/chefs/${props.chef.id}`)
}
</script>

<style scoped>
.chef-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chef-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.chef-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.avatar-container {
  flex-shrink: 0;
}

.chef-info {
  flex: 1;
  min-width: 0;
}

.chef-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0 0 var(--space-1) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chef-title {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  font-weight: 500;
  margin: 0 0 var(--space-2) 0;
}

.chef-bio {
  font-size: 0.875rem;
  color: var(--ui-text);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chef-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stat-icon {
  width: var(--space-4);
  height: var(--space-4);
  color: var(--ui-text-muted);
  flex-shrink: 0;
}

.stat-text {
  font-size: 0.875rem;
  color: var(--ui-text);
}

.chef-specialties {
  margin-bottom: var(--space-4);
}

.specialties-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.specialties-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.availability-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: rgb(34 197 94 / 0.1);
  border: 1px solid rgb(34 197 94 / 0.2);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.available-icon {
  width: var(--space-4);
  height: var(--space-4);
  color: rgb(34 197 94);
}

.available-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(21 128 61);
}

.chef-location {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.location-icon {
  width: var(--space-4);
  height: var(--space-4);
  color: var(--ui-text-muted);
}

.location-text {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

.chef-footer {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-4);
}

.chef-footer > * {
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .chef-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .chef-footer {
    flex-direction: column;
  }

  .chef-footer > * {
    flex: none;
  }
}
</style>
