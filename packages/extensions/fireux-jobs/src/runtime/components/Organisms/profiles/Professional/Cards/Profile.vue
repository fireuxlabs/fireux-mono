<template>
  <UCard class="profile-cell professional-cell">
    <div class="profile-header">
      <UAvatar
        :src="professional?.avatarUrl || professional?.profile_image?.url"
        :alt="professional?.professional_name || 'Professional'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="professional?.professional_name" class="profile-name">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
        <div v-if="professional?.locations?.length" class="profile-location">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText(professional.locations[0]) }}</span>
        </div>
        <div v-if="getExperienceYears() > 0" class="profile-meta">
          {{ getExperienceYears() }}+ years experience
        </div>
      </div>
    </div>
    <p
      v-if="professional?.bio_long || professional?.bio_short"
      class="profile-bio"
    >
      {{ professional.bio_long || professional.bio_short }}
    </p>

    <div v-if="professional?.cuisine_types?.length" class="profile-tags">
      <span
        v-for="cuisine in professional.cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="profile-tag"
      >
        {{ cuisine }}
      </span>
      <span
        v-if="professional.cuisine_types.length > 3"
        class="profile-tag-more"
      >
        +{{ professional.cuisine_types.length - 3 }} more
      </span>
    </div>

    <div v-if="professional?.skills?.length" class="profile-section">
      <strong class="section-label">Skills:</strong>
      <span
        v-for="skill in professional.skills.slice(0, 2)"
        :key="skill"
        class="profile-tag"
      >
        {{ skill }}
      </span>
      <span v-if="professional.skills.length > 2" class="profile-tag-more">
        +{{ professional.skills.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="professional?.hourly_rate" class="profile-stat">
        <UIcon name="i-lucide-dollar-sign" />
        <span>${{ professional.hourly_rate }}/hour</span>
      </div>
      <div v-if="professional?.availability" class="profile-stat">
        <UIcon name="i-lucide-clock" />
        <span>{{ professional.availability }}</span>
      </div>
      <div v-if="latestExp" class="profile-stat">
        <UIcon name="i-lucide-building" />
        <span>{{ latestExp.role }} at {{ latestExp.name }}</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Professional } from '../../../../../models/profiles/Professional.model'

defineProps<{
  professional?: Partial<Professional>
}>()

const getLocationText = (location: any) => {
  if (location?.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}

const getExperienceYears = () => {
  // Implementation would depend on professional experience data structure
  return 5 // Placeholder
}

const latestExp = computed(() => {
  // Implementation would return latest experience
  return null // Placeholder
})
</script>
