<template>
  <NuxtLink
    :to="vmTo"
    class="block rounded-lg border border-[var(--ui-border)] px-3 py-2 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-center gap-3">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="sm" />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ vmTitle }}</div>
            <div v-if="vmSubtitle" class="truncate text-sm text-dimmed">{{ vmSubtitle }}</div>
          </div>

          <div v-if="vmBadges.length" class="flex flex-wrap justify-end gap-1">
            <UBadge
              v-for="badge in vmBadges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div class="mt-1 text-sm text-dimmed">
          <span v-if="vmLine1">{{ vmLine1 }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  professional?: ProfessionalCard.Card | null
  prop?: string
}>()

const resolved = computed<ProfessionalCard.Card | null>(() => props.professional ?? null)

const resolvedTitle = computed(() => resolved.value?.title ?? 'Professional')
const resolvedSubtitle = computed(() => resolved.value?.subtitle || undefined)
const resolvedAvatar = computed(() => resolved.value?.avatar || null)
const resolvedBadges = computed(() => resolved.value?.badges ?? [])
const resolvedTo = computed(() => resolved.value?.to ?? '')

const resolvedLine1 = computed(() => {
  if (typeof props.prop === 'string') return props.prop
  return resolved.value?.line1 ?? ''
})

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)
const vmTo = computed(() => resolvedTo.value || '#')
const vmLine1 = computed(() => String(resolvedLine1.value ?? '').trim())
</script>
