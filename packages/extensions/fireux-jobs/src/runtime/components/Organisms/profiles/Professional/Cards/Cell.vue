<template>
  <UCard class="profiles cards card professional-theme">
    <div class="header">
      <UAvatar
        :src="professional?.avatarUrl || professional?.profile_image?.url"
        :alt="professional?.professional_name || 'Professional'"
        size="lg"
      />
      <div class="info">
        <h4 v-if="professional?.professional_name" class="title">
          {{ professional.professional_name }}
        </h4>
        <p v-if="professional?.title" class="subtitle">
          {{ professional.title }}
        </p>
        <div v-if="professional?.locations?.length" class="stat">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText(professional.locations[0]) }}</span>
        </div>
      </div>
    </div>

    <p v-if="professional?.bio_short" class="description">
      {{ professional.bio_short }}
    </p>

    <div v-if="professional?.cuisine_types?.length" class="tags">
      <span
        v-for="cuisine in professional.cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
      <span v-if="professional.cuisine_types.length > 3" class="tag">
        +{{ professional.cuisine_types.length - 3 }} more
      </span>
    </div>

    <div v-if="professional?.kitchen_experience?.length" class="stats">
      <div class="stat">
        <UIcon name="i-lucide-briefcase" />
        <span>{{ getExperienceYears() }}+ years experience</span>
      </div>
      <div v-if="latestExp" class="stat">
        <UIcon name="i-lucide-building" />
        <span>{{ latestExp.role }} at {{ latestExp.name }}</span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Professional } from '../../../../../models/profiles/Professional.model'
type ProfessionalView = Professional & {
  profile_image?: { url?: string }
  cuisine_types?: string[]
}

const props = defineProps<{ professional?: Partial<ProfessionalView> }>()

const getLocationText = (location: any) => {
  if (location?.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}

const getExperienceYears = () => {
  if (!props.professional?.kitchen_experience?.length) return 0

  const experiences = props.professional.kitchen_experience
  const startYear = Math.min(
    ...experiences.map((exp) =>
      parseInt((exp.from_year || String(new Date().getFullYear())) as string)
    )
  )
  const currentYear = new Date().getFullYear()

  return currentYear - startYear
}

const getLatestExperience = () => {
  if (!props.professional?.kitchen_experience?.length) return null

  // Find ongoing experience or most recent
  const ongoing = props.professional.kitchen_experience.find(
    (exp) => exp.ongoing
  )
  if (ongoing) return ongoing

  // Sort by end date and get most recent
  const sorted = [...props.professional.kitchen_experience].sort((a, b) => {
    const aYear = parseInt(
      (a.to_year || String(new Date().getFullYear())) as string
    )
    const bYear = parseInt(
      (b.to_year || String(new Date().getFullYear())) as string
    )
    return bYear - aYear
  })

  return sorted[0] || null
}

const latestExp = computed(() => getLatestExperience())
</script>
