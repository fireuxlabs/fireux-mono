<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ vmTitle }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="vmSubtitle">{{ vmSubtitle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
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
    </template>

    <div class="space-y-4">
      <div v-if="vmProp" class="text-sm text-dimmed">
        {{ vmProp }}
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="vmLine1">{{ vmLine1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Specialties</div>
        <div class="text-sm">
          <span v-if="vmLine2">{{ vmLine2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Locations</div>
        <div class="text-sm">
          <span v-if="vmLine3">{{ vmLine3 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
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

const resolvedLine1 = computed(() => {
  if (typeof props.prop === 'string') return props.prop
  return resolved.value?.line1 ?? ''
})
const resolvedLine2 = computed(() => resolved.value?.line2 ?? '')
const resolvedLine3 = computed(() => resolved.value?.line3 ?? '')

const vmTitle = computed(() => props.title ?? resolvedTitle.value)
const vmSubtitle = computed(() => props.subtitle ?? resolvedSubtitle.value)
const vmAvatar = computed(() => props.avatar ?? resolvedAvatar.value)
const vmBadges = computed(() => resolvedBadges.value)

const vmProp = computed(() => (typeof props.prop === 'string' ? props.prop : ''))

const vmLine1 = computed(() => String(resolvedLine1.value ?? '').trim())
const vmLine2 = computed(() => String(resolvedLine2.value ?? '').trim())
const vmLine3 = computed(() => String(resolvedLine3.value ?? '').trim())
</script>
