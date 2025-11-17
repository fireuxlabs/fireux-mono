<template>
  <UCard
    :class="[
      ui.surface.base,
      ui.surface.padding.spacious,
      ui.layout.stack,
      ui.surface.interactive,
      'cursor-pointer',
    ]"
    @click="handleClick"
  >
    <div :class="ui.layout.header">
      <UAvatar
        :src="(professional as any)?.avatar"
        :alt="(professional as any)?.display_name || 'Professional'"
        size="lg"
      />
      <div :class="ui.layout.infoStack">
        <h4 v-if="(professional as any)?.display_name" :class="ui.text.nameLg">
          {{ (professional as any)?.display_name }}
        </h4>
        <p v-if="professional?.title" :class="ui.text.subtitle">
          {{ professional.title }}
        </p>
        <div
          v-if="(professional as any)?.locations?.length"
          :class="ui.layout.metaRow"
        >
          <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-gray-400" />
          <span>{{ getLocationText((professional as any).locations[0]) }}</span>
        </div>
        <div v-if="experienceYears > 0" :class="ui.text.meta">
          {{ experienceYears }}+ years experience
        </div>
      </div>
    </div>
    <p
      v-if="(professional as any)?.bio_long || (professional as any)?.bio_short"
      :class="ui.text.body"
    >
      {{ (professional as any)?.bio_long || (professional as any)?.bio_short }}
    </p>

    <div
      v-if="(professional as any)?.cuisine_types?.length"
      :class="ui.chip.group"
    >
      <span
        v-for="cuisine in (professional as any).cuisine_types.slice(0, 3)"
        :key="cuisine"
        :class="ui.chip.item"
      >
        {{ cuisine }}
      </span>
      <span
        v-if="(professional as any).cuisine_types.length > 3"
        :class="ui.chip.more"
      >
        +{{ (professional as any).cuisine_types.length - 3 }} more
      </span>
    </div>

    <div
      v-if="(professional as any)?.skills?.length"
      :class="['text-sm text-gray-500', ui.layout.split]"
    >
      <strong :class="ui.text.meta">Skills:</strong>
      <span
        v-for="skill in (professional as any).skills.slice(0, 2)"
        :key="skill"
        :class="ui.chip.item"
      >
        {{ skill }}
      </span>
      <span
        v-if="(professional as any).skills.length > 2"
        :class="ui.chip.more"
      >
        +{{ (professional as any).skills.length - 2 }} more
      </span>
    </div>

    <div :class="['pt-3', ui.stats.row]">
      <div v-if="(professional as any)?.hourly_rate" :class="ui.stats.item">
        <UIcon name="i-lucide-dollar-sign" class="h-4 w-4 text-gray-400" />
        <span>${{ (professional as any).hourly_rate }}/hour</span>
      </div>
      <div v-if="(professional as any)?.availability" :class="ui.stats.item">
        <UIcon name="i-lucide-clock" class="h-4 w-4 text-gray-400" />
        <span>{{ (professional as any).availability }}</span>
      </div>
      <div v-if="latestExp" :class="ui.stats.item">
        <UIcon name="i-lucide-building" class="h-4 w-4 text-gray-400" />
        <span>{{ latestExp.role }} at {{ latestExp.name }}</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { profileUi } from '../../shared/profileUi'

const props = defineProps<{
  professional?: any
  navigate?: (profile: any) => void
}>()

const ui = profileUi

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

const allExperience = computed<any[]>(() => {
  const p: any = props.professional || {}
  const rel = Array.isArray(p?.relevant_experience) ? p.relevant_experience : []
  const oth = Array.isArray(p?.other_experience) ? p.other_experience : []
  return [...rel, ...oth]
})

const experienceYears = computed(() => getExperienceYears(allExperience.value))

const latestExp = computed(() => {
  const list = allExperience.value
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
