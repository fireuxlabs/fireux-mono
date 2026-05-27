<template>
  <NuxtLink
    v-if="link && to"
    :to="to"
    class="pill"
  >
    <div class="flex min-w-0 items-start gap-2">
      <div class="shrink-0">
        <UChip
          :color="isActiveNow ? 'success' : 'error'"
          position="top-left"
          inset
        >
          <UAvatar
            :src="imageUrl || undefined"
            :alt="title || ''"
            size="sm"
            icon="i-lucide-book-open-check"
          />
        </UChip>
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
          <UBadge v-for="badge in badges" :key="badge" variant="soft" color="neutral" size="xs">
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </NuxtLink>

  <div
    v-else
    class="pill"
    @click="onClick"
  >
    <div class="flex min-w-0 items-start gap-2">
      <div class="shrink-0">
        <UChip
          :color="isActiveNow ? 'success' : 'error'"
          position="top-left"
          inset
        >
          <UAvatar
            :src="imageUrl || undefined"
            :alt="title || ''"
            size="sm"
            icon="i-lucide-book-open-check"
          />
        </UChip>
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
          <UBadge v-for="badge in badges" :key="badge" variant="soft" color="neutral" size="xs">
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import type { MenuCard } from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type PillProps = Pick<MenuCard.Card, 'to' | 'title' | 'subtitle' | 'imageUrl' | 'isActiveNow'> & {
  showSubtitle?: boolean
  badges?: string[]
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  badges: () => [],
  showBadges: true,
  link: false,
  action: false,
})

const onClick = (event?: MouseEvent) => {
  if (props.action) {
    emit('action')
    return
  }

  if (!props.link || !props.to) return
  if (event?.currentTarget instanceof HTMLAnchorElement) return

  navigateTo(props.to)
}
</script>
