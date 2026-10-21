<template>
  <MoleculesActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="block w-full"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="avatarUrl || undefined"
        :style="
          imageFit === 'contain' && imageBackground
            ? { backgroundColor: imageBackground }
            : undefined
        "
        :ui="
          imageFit === 'contain' ? { image: 'object-contain p-1' } : undefined
        "
        icon="i-lucide-store"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ title }}</div>
            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ subtitle }}
            </div>
          </div>

          <div
            v-if="showBadges && badges.length"
            class="flex shrink-0 flex-wrap items-center gap-1"
          >
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="prop || summary">{{ prop || summary }}</span>
          <span v-else>{{ id }}</span>
        </div>
      </div>
    </div>
  </MoleculesActionSurface>
</template>

<script setup lang="ts">

import type { SupplierCard } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(
  defineProps<{
    to?: string
    id: string
    title: string
    subtitle: string
    avatarUrl: string
    imageFit?: 'contain' | 'cover'
    imageBackground?: string
    badges?: SupplierCard.Card['badges']
    summary?: SupplierCard.Card['summary']
    prop?: string
    showSubtitle?: boolean
    showBadges?: boolean
    showTagline?: boolean
    link?: boolean
    action?: boolean
  }>(),
  {
    badges: () => [],
    summary: '',
    prop: '',
    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    link: false,
    action: false,
  }
)

</script>
