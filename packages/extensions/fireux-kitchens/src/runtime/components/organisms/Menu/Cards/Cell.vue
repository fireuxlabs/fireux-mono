<template>
  <component
    :is="link && to ? 'NuxtLink' : 'div'"
    :to="link && to ? to : undefined"
    class="block w-full"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 transition hover:bg-[var(--ui-bg-elevated)]"
    >
      <UAvatar
        :src="imageUrl"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ name }}</div>

            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ subtitle }}
            </div>
          </div>

          <div class="shrink-0 pt-0.5">
            <UChip :color="isActiveNow ? 'success' : 'error'" inset />
          </div>
        </div>

        <div class="truncate text-xs text-dimmed">
          <span>Dishes: {{ dishCount }}</span>
          <template v-if="windowLabel">
            <span class="mx-1">·</span>
            <span>{{ windowLabel }}</span>
          </template>
        </div>

        <div v-if="showTagline && prop" class="truncate text-xs text-dimmed">
          <span>{{ prop }}</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import type { MenuCard } from '../../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type Props = Pick<
  MenuCard.Card,
  | 'to'
  | 'name'
  | 'subtitle'
  | 'active'
  | 'dishCount'
  | 'imageUrl'
  | 'isActiveNow'
  | 'windowLabel'
> & {
  prop?: string
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showTagline: true,
  link: false,
})
</script>
