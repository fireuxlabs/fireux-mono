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
import type { ChefProfile } from '../../../../../models/profiles/Chef/Chef.model'
import type { ChefCard } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface'
import { resolveChefPill } from '../../../../../composables/fireux/firestore/profiles/Chef/main/useChefInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  chef?: ChefCard.Pill | ChefProfile | null
  prop?: string
}>()

const resolved = computed<ChefCard.Pill | null>(() => {
  const source = props.chef
  if (!source) return null
  if ('user' in source) return resolveChefPill(source)
  return source as ChefCard.Pill
})

const resolvedTitle = computed(() => resolved.value?.title ?? 'Chef')
const resolvedSubtitle = computed(
  () => resolved.value?.tagline ?? resolved.value?.subtitle ?? undefined
)
const resolvedAvatar = computed(() => resolved.value?.avatar ?? null)

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
</script>
