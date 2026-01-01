<template>
  <UCard class="space-y-6">
    <div class="flex items-start gap-4">
      <UAvatar :src="vmAvatar || undefined" :alt="vmTitle" size="lg" />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="truncate text-lg font-semibold">{{ vmTitle }}</div>
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

        <div class="text-sm text-dimmed">
          <span v-if="vmProp">{{ vmProp }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="vmLine1">{{ vmLine1 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Specialties</div>
        <div class="text-sm">
          <span v-if="vmLine2">{{ vmLine2 }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Locations</div>
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
import type { SupplierCard } from '../../../../../composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  supplier?: SupplierCard.Card | null
  prop?: string
}>()

const resolved = computed<SupplierCard.Card | null>(() => props.supplier ?? null)

const resolvedTitle = computed(() => resolved.value?.title ?? 'Supplier')
const resolvedSubtitle = computed(() => resolved.value?.subtitle || undefined)
const resolvedAvatar = computed(() => resolved.value?.avatar || null)
const resolvedBadges = computed(() => resolved.value?.badges ?? [])

const resolvedLine1 = computed(() => resolved.value?.line1 ?? '')
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
