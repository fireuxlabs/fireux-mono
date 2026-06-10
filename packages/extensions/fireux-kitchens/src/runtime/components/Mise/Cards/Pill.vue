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
        :icon="icon || 'i-lucide-list-checks'"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <UBadge
          v-if="hasMissingTitle"
          color="error"
          variant="soft"
          size="xs"
        >
          Missing title
        </UBadge>
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
        :icon="icon || 'i-lucide-list-checks'"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <UBadge
          v-if="hasMissingTitle"
          color="error"
          variant="soft"
          size="xs"
        >
          Missing title
        </UBadge>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import type { MiseEnPlaceCard } from '../../../composables/fireux/console/kitchen/Operations/Mise/utils/view/useMiseEnPlaceInterface'

type PillProps = Pick<
  MiseEnPlaceCard.Card,
  'to' | 'title' | 'imageUrl' | 'icon' | 'hasMissingTitle'
> & {
  subtitle?: string
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  subtitle: '',
  showSubtitle: true,
  icon: 'i-lucide-list-checks',
  hasMissingTitle: false,
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
