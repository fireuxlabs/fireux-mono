<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ vmTitle }}</div>
        <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalProfile } from '../../../../../models/profiles/Professional/Professional.model'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'
import { resolveProfessionalCell } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  professional?: ProfessionalCard.ProfessionalCell | ProfessionalProfile | null
  prop?: string
}>()

const resolved = computed<ProfessionalCard.ProfessionalCell | null>(() => {
  const source = props.professional
  if (!source) return null
  if ('bio_short' in source || 'specialties' in source || 'locations' in source) {
    return source as ProfessionalCard.ProfessionalCell
  }
  return resolveProfessionalCell(source as ProfessionalProfile)
})

const resolvedTitle = computed(() => resolved.value?.title ?? 'Professional')
const resolvedSubtitle = computed(
  () => resolved.value?.tagline ?? resolved.value?.subtitle ?? undefined
)
const resolvedAvatar = computed(() => resolved.value?.avatar ?? null)

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
</script>
