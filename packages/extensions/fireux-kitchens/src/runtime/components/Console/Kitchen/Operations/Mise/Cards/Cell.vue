<template>
  <NuxtLink
  v-if="link && to"
  :to="to"
  class="block min-w-0 w-full"
>
    <div
      class="fx-card--cell"
    >
      <UAvatar
        :src="imageUrl || undefined"
        :icon="icon || 'i-lucide-list-checks'"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
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
        </div>

        <div
          v-if="showTagline"
          class="truncate text-xs text-dimmed"
        >
          <span v-if="prop || description">{{ prop || description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</NuxtLink>

<div
  v-else
  class="block min-w-0 w-full"
  @click="onClick"
>
    <div
      class="fx-card--cell"
    >
      <UAvatar
        :src="imageUrl || undefined"
        :icon="icon || 'i-lucide-list-checks'"
        size="md"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
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
        </div>

        <div
          v-if="showTagline"
          class="truncate text-xs text-dimmed"
        >
          <span v-if="prop || description">{{ prop || description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'

import type { MiseEnPlaceCard } from '../../../../../../composables/fireux/console/kitchen/operations/Mise/utils/view/useMiseEnPlaceInterface'

type Props = Partial<Pick<
  MiseEnPlaceCard.Card,
  'to' | 'name' | 'subtitle' | 'icon' | 'imageUrl' | 'description'
>> & {
  prop?: string
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  to: '',
  name: '',
  subtitle: '',
  imageUrl: '',
  description: '',
  prop: '',
  showSubtitle: true,
  icon: 'i-lucide-list-checks',
  showTagline: true,
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
