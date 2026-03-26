<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="block w-full"
>
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="imageUrl || undefined"
        icon="i-lucide-utensils"
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

          <UBadge
            variant="soft"
            :color="active ? 'success' : 'neutral'"
            size="xs"
            class="shrink-0"
          >
            {{ active ? 'active' : 'inactive' }}
          </UBadge>
        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="description">{{ description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</NuxtLink>

<div
  v-else
  class="block w-full"
  @click="onClick"
>
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="imageUrl || undefined"
        icon="i-lucide-utensils"
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

          <UBadge
            variant="soft"
            :color="active ? 'success' : 'neutral'"
            size="xs"
            class="shrink-0"
          >
            {{ active ? 'active' : 'inactive' }}
          </UBadge>
        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div v-if="showTagline" class="truncate text-xs text-dimmed">
          <span v-if="description">{{ description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">

import type { DishCard } from '../../../../composables/fireux/firestore/runtime-kitchen/dish/utils/view/useDishInterface'

type Props = Pick<
  DishCard.Card,
  'to' | 'title' | 'subtitle' | 'active' | 'imageUrl' | 'description' | 'meta'
> & {
  showSubtitle?: boolean
  showMeta?: boolean
  showTagline?: boolean
  link?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showMeta: true,
  showTagline: true,
  link: false,
})
</script>
