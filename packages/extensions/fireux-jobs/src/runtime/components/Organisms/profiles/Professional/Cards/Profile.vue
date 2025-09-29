<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="(professional as any)?.avatar"
        :alt="(professional as any)?.display_name || 'Professional'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="(professional as any)?.display_name" class="profile-name">
          {{ (professional as any)?.display_name }}
        </h4>
        <p v-if="professional?.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
        <div
          v-if="(professional as any)?.locations?.length"
          class="profile-location"
        >
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText((professional as any).locations[0]) }}</span>
        </div>
        <div
          v-if="
            getExperienceYears((professional as any)?.kitchen_experience) > 0
          "
          class="profile-meta"
        >
          {{ getExperienceYears((professional as any)?.kitchen_experience) }}+
          years experience
        </div>
      </div>
    </div>
    <p
      v-if="(professional as any)?.bio_long || (professional as any)?.bio_short"
      class="profile-bio"
    >
      {{ (professional as any)?.bio_long || (professional as any)?.bio_short }}
    </p>

    <div
      v-if="(professional as any)?.cuisine_types?.length"
      class="profile-tags"
    >
      <span
        v-for="cuisine in (professional as any).cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
      <span
        v-if="(professional as any).cuisine_types.length > 3"
        class="tag-more"
      >
        +{{ (professional as any).cuisine_types.length - 3 }} more
      </span>
    </div>

    <div v-if="(professional as any)?.skills?.length" class="profile-section">
      <strong class="section-label">Skills:</strong>
      <span
        v-for="skill in (professional as any).skills.slice(0, 2)"
        :key="skill"
        class="tag"
      >
        {{ skill }}
      </span>
      <span v-if="(professional as any).skills.length > 2" class="tag-more">
        +{{ (professional as any).skills.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="(professional as any)?.hourly_rate" class="profile-stat">
        <UIcon name="i-lucide-dollar-sign" />
        <span>${{ (professional as any).hourly_rate }}/hour</span>
      </div>
      <div v-if="(professional as any)?.availability" class="profile-stat">
        <UIcon name="i-lucide-clock" />
        <span>{{ (professional as any).availability }}</span>
      </div>
      <div v-if="latestExp" class="profile-stat">
        <UIcon name="i-lucide-building" />
        <span>{{ latestExp.role }} at {{ latestExp.name }}</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  professional?: any
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.professional) {
    props.navigate(props.professional)
  }
}

// Helper utilities for legacy/extended fields
function getLocationText(location: any): string {
  if (!location) return ''
  if (location?.formatted_address) {
    return String(location.formatted_address)
  }
  // Fallbacks used elsewhere in app
  if (location?.city || location?.country) {
    return [location.city, location.country].filter(Boolean).join(', ')
  }
  return 'Location not specified'
}

function getExperienceYears(experiences: any[] | undefined): number {
  if (!Array.isArray(experiences) || experiences.length === 0) return 0
  // Simple heuristic: count unique years across ranges
  let years = 0
  for (const exp of experiences) {
    const from = parseInt(exp?.from_year) || 0
    const to = exp?.ongoing
      ? new Date().getFullYear()
      : parseInt(exp?.to_year) || from
    years += Math.max(0, to - from)
  }
  return years
}

const latestExp = computed(() => {
  const list = (props.professional as any)?.kitchen_experience as
    | any[]
    | undefined
  if (!Array.isArray(list) || list.length === 0) return null as any
  const ongoing = list.find((e) => e?.ongoing)
  if (ongoing) return ongoing
  const sorted = [...list].sort((a, b) => {
    const aYear = parseInt(a?.to_year || new Date().getFullYear())
    const bYear = parseInt(b?.to_year || new Date().getFullYear())
    return bYear - aYear
  })
  return sorted[0] || null
})
</script>
