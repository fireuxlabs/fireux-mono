<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="pill"
>
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
        icon="i-lucide-building-2"
      />

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
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
        icon="i-lucide-building-2"
      />

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

import type { ClientCard } from '../../../composables/fireux/console/portfolio/Operations/Clients/utils/view/useClientInterface'

type PillProps = Pick<ClientCard.Card, 'to' | 'imageUrl' | 'title' | 'subtitle' | 'meta' | 'status'> & {
  showSubtitle?: boolean
  showMeta?: boolean
  badges?: string[]
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  showSubtitle: true,
  showMeta: true,
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
