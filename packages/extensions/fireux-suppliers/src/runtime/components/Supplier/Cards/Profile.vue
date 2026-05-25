<template>
  <UCard class="space-y-6">
    <div class="flex items-start gap-4">
      <UAvatar :src="vm.avatar || undefined" :alt="vm.title" size="lg" />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="truncate text-lg font-semibold">{{ vm.title }}</div>
            <div v-if="vm.subtitle" class="truncate text-sm text-dimmed">
              {{ vm.subtitle }}
            </div>
          </div>

          <div v-if="vm.badges.length" class="flex flex-wrap justify-end gap-1">
            <UBadge
              v-for="badge in vm.badges"
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
          <span v-if="vm.prop">{{ vm.prop }}</span>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Summary</div>
        <div class="text-sm">
          <span v-if="vm.summary">{{ vm.summary }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Organization</div>
        <div class="text-sm">
          <span v-if="vm.organizationName">{{ vm.organizationName }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Coverage</div>
        <div class="text-sm">
          <span v-if="vm.locationsLabel">{{ vm.locationsLabel }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs font-medium text-dimmed">Categories</div>
        <div class="text-sm">
          <span v-if="vm.categoriesCsv">{{ vm.categoriesCsv }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierCard } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = defineProps<{
  title?: string
  subtitle?: string
  avatar?: string | null
  avatarSecondary?: string | null
  card?: SupplierCard.Card | null
  prop?: string
}>()

const resolvedCard = computed<SupplierCard.Card | null>(() => {
  return props.card ?? null
})

const vm = computed(() => {
  const card = resolvedCard.value

  const title = props.title ?? card?.title ?? ''
  const subtitle = props.subtitle ?? (card?.subtitle || undefined)
  const avatar = props.avatar ?? (card?.avatarUrl || null)
  const badges = card?.badges ?? []

  const prop = typeof props.prop === 'string' ? props.prop : ''
  const summary = String(card?.summary ?? '').trim()
  const organizationName = String(card?.organizationName ?? '').trim()
  const locationsLabel = String(card?.locationsLabel ?? '').trim()
  const categoriesCsv = String(card?.categoriesCsv ?? '').trim()

  return {
    title,
    subtitle,
    avatar,
    badges,
    prop,
    summary,
    organizationName,
    locationsLabel,
    categoriesCsv,
  }
})
</script>
