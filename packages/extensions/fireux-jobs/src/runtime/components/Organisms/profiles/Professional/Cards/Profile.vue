<template>
  <UCard
    class="flex cursor-pointer flex-col gap-4 rounded-2xl border border-gray-100 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800"
    @click="handleClick"
  >
    <div class="flex items-start gap-4">
      <UAvatar
        :src="(professional as any)?.avatar"
        :alt="(professional as any)?.display_name || 'Professional'"
        size="lg"
      />
      <div class="flex flex-col gap-1">
        <h4
          v-if="(professional as any)?.display_name"
          class="text-xl font-semibold text-gray-900 dark:text-gray-100"
        >
          {{ (professional as any)?.display_name }}
        </h4>
        <p
          v-if="professional?.title"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ professional.title }}
        </p>
        <div
          v-if="(professional as any)?.locations?.length"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-gray-400" />
          <span>{{ getLocationText((professional as any).locations[0]) }}</span>
        </div>
        <div
          v-if="experienceYears > 0"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ experienceYears }}+ years experience
        </div>
      </div>
    </div>
    <p
      v-if="(professional as any)?.bio_long || (professional as any)?.bio_short"
      class="text-sm text-gray-600 dark:text-gray-300"
    >
      {{ (professional as any)?.bio_long || (professional as any)?.bio_short }}
    </p>

    <div
      v-if="(professional as any)?.cuisine_types?.length"
      class="flex flex-wrap gap-2"
    >
      <span
        v-for="cuisine in (professional as any).cuisine_types.slice(0, 3)"
        :key="cuisine"
        class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {{ cuisine }}
      </span>
      <span
        v-if="(professional as any).cuisine_types.length > 3"
        class="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
      >
        +{{ (professional as any).cuisine_types.length - 3 }} more
      </span>
    </div>

    <div
      v-if="(professional as any)?.skills?.length"
      class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
    >
      <strong class="font-medium">Skills:</strong>
      <span
        v-for="skill in (professional as any).skills.slice(0, 2)"
        :key="skill"
        class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {{ skill }}
      </span>
      <span
        v-if="(professional as any).skills.length > 2"
        class="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
      >
        +{{ (professional as any).skills.length - 2 }} more
      </span>
    </div>

    <div
      class="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300"
    >
      <div
        v-if="(professional as any)?.hourly_rate"
        class="inline-flex items-center gap-2"
      >
        <UIcon name="i-lucide-dollar-sign" class="h-4 w-4 text-gray-400" />
        <span>${{ (professional as any).hourly_rate }}/hour</span>
      </div>
      <div
        v-if="(professional as any)?.availability"
        class="inline-flex items-center gap-2"
      >
        <UIcon name="i-lucide-clock" class="h-4 w-4 text-gray-400" />
        <span>{{ (professional as any).availability }}</span>
      </div>
      <div v-if="latestExp" class="inline-flex items-center gap-2">
        <UIcon name="i-lucide-building" class="h-4 w-4 text-gray-400" />
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
