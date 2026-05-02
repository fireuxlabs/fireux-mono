<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="block w-full"
>
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 transition hover:bg-[var(--ui-bg-elevated)]"
    >
      <div class="shrink-0">
        <UChip
          :color="isActiveNow ? 'success' : 'error'"
          position="top-left"
          inset
        >
          <UAvatar
            :src="imageUrl"
            icon="i-lucide-book-open-check"
            size="md"
          />
        </UChip>
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
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

        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div v-if="showTagline && description" class="truncate text-xs text-dimmed">
          <span>{{ description }}</span>
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
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 transition hover:bg-[var(--ui-bg-elevated)]"
    >
      <div class="shrink-0">
        <UChip
          :color="isActiveNow ? 'success' : 'error'"
          position="top-left"
          inset
        >
          <UAvatar
            :src="imageUrl"
            icon="i-lucide-book-open-check"
            size="md"
          />
        </UChip>
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
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

        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="meta">{{ meta }}</span>
          <span v-else class="italic">missing</span>
        </div>

        <div v-if="showTagline && description" class="truncate text-xs text-dimmed">
          <span>{{ description }}</span>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">

import type { MenuCard } from '../../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface'

type Props = Pick<
  MenuCard.Card,
  | 'to'
  | 'title'
  | 'subtitle'
  | 'meta'
  | 'active'
  | 'description'
  | 'imageUrl'
  | 'isActiveNow'
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
