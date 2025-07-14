<template>
  <UCard>
    <div class="supplier-profile-header">
      <UAvatar
        :src="supplier?.avatar"
        :alt="supplier?.business_name"
        size="xl"
        :text="getInitials(supplier?.business_name)"
      />
      <div class="supplier-info">
        <h2 class="supplier-name">
          {{ supplier?.business_name || 'Supplier' }}
        </h2>
        <p v-if="supplier?.title" class="supplier-title">
          {{ supplier.title }}
        </p>
      </div>
    </div>

    <div
      v-if="supplier?.bio_short || supplier?.bio_long"
      class="supplier-about"
    >
      <h3 class="section-title">About</h3>
      <p class="section-content">
        {{ supplier.bio_long || supplier.bio_short }}
      </p>
    </div>

    <div v-if="hasSpecialties" class="supplier-specialties">
      <h3 class="section-title">Specialties</h3>
      <div class="specialties-grid">
        <UBadge
          v-for="specialty in supplier.specialties"
          :key="specialty"
          variant="soft"
        >
          {{ specialty }}
        </UBadge>
      </div>
    </div>

    <!-- Location - Remove since Supplier model doesn't have location -->
    <!-- Future: If needed, location data would need to be added to Supplier model -->

    <div class="supplier-stats">
      <h3 class="section-title">Business Stats</h3>
      <div class="stats-grid">
        <div v-if="supplier?.total_items" class="stat-card">
          <UIcon name="i-lucide-package" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ supplier.total_items }}</span>
            <span class="stat-label">Items Available</span>
          </div>
        </div>
        <div v-if="supplier?.total_connections" class="stat-card">
          <UIcon name="i-lucide-link" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-value">{{ supplier.total_connections }}</span>
            <span class="stat-label">Connections</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../../../../../models/Supplier.model'

interface Props {
  supplier: Supplier
}

const props = defineProps<Props>()

const hasSpecialties = computed(() => {
  return props.supplier?.specialties && props.supplier.specialties.length > 0
})

function getInitials(name?: string): string {
  if (!name) return 'S'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.supplier-profile-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.supplier-info {
  flex: 1;
}

.supplier-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.supplier-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #3b82f6;
  margin-top: 0.25rem;
}

.supplier-about,
.supplier-categories,
.supplier-location,
.supplier-stats {
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
