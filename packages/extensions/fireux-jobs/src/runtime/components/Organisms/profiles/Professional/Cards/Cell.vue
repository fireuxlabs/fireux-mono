<template>
  <div class="professional-cell">
    <div class="cell-header">
      <div class="professional-avatar">
        <img
          :src="professional.avatarUrl || '/default-avatar.png'"
          :alt="professional.displayName"
          class="avatar-image"
        />
      </div>
      <div class="professional-info">
        <h3 class="professional-name">{{ professional.displayName }}</h3>
        <p class="professional-title">{{ professional.title }}</p>
        <div
          class="professional-location"
          v-if="professional.locations?.length"
        >
          <UIcon name="i-lucide-map-pin" class="location-icon" />
          <span>{{ getLocationText(professional.locations[0]) }}</span>
        </div>
      </div>
      <div class="cell-actions">
        <UButton
          :to="`/professionals/${professional.id}`"
          variant="outline"
          size="sm"
        >
          View Profile
        </UButton>
      </div>
    </div>

    <div class="cell-content">
      <p class="professional-bio">{{ professional.bio_short }}</p>

      <div class="professional-tags" v-if="professional.cuisine_types?.length">
        <span
          v-for="cuisine in professional.cuisine_types.slice(0, 3)"
          :key="cuisine"
          class="cuisine-tag"
        >
          {{ cuisine }}
        </span>
        <span v-if="professional.cuisine_types.length > 3" class="more-tags">
          +{{ professional.cuisine_types.length - 3 }} more
        </span>
      </div>

      <div
        class="professional-experience"
        v-if="professional.kitchen_experience?.length"
      >
        <div class="experience-item">
          <span class="experience-role">{{
            getLatestExperience(professional.kitchen_experience).role
          }}</span>
          <span class="experience-place">{{
            getLatestExperience(professional.kitchen_experience).name
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

const getLocationText = (location) => {
  if (location.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}

const getLatestExperience = (experiences) => {
  if (!experiences?.length) return { role: '', name: '' }

  // Find ongoing experience or most recent
  const ongoing = experiences.find((exp) => exp.ongoing)
  if (ongoing) return ongoing

  // Sort by end date and get most recent
  const sorted = [...experiences].sort((a, b) => {
    const aYear = parseInt(a.to_year || new Date().getFullYear())
    const bYear = parseInt(b.to_year || new Date().getFullYear())
    return bYear - aYear
  })

  return sorted[0] || { role: '', name: '' }
}
</script>

<style scoped>
.professional-cell {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.professional-cell:hover {
  border-color: var(--professional-primary, #3b82f6);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.cell-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.professional-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.professional-info {
  flex: 1;
  min-width: 0;
}

.professional-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.professional-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.professional-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.location-icon {
  width: 12px;
  height: 12px;
}

.cell-actions {
  flex-shrink: 0;
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.professional-bio {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.professional-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.cuisine-tag {
  background: #eff6ff;
  color: var(--professional-primary, #3b82f6);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-tags {
  color: #6b7280;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.professional-experience {
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.experience-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.experience-role {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.experience-place {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .professional-cell {
    padding: 1rem;
  }

  .cell-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .cell-actions {
    align-self: stretch;
  }

  .avatar-image {
    width: 48px;
    height: 48px;
  }
}
</style>
