<template>
  <component
    :is="link && props.to ? 'NuxtLink' : 'div'"
    :to="link && props.to ? props.to : undefined"
    class="block w-full"
    @click="onClick"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-gray-200/60 bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800/60 dark:bg-gray-900/40"
    >
      <UAvatar
        :src="props.imageUrl || undefined"
        :alt="props.title"
        size="md"
        icon="i-lucide-building"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ props.title }}</div>
            <div v-if="showSubtitle && props.subtitle" class="truncate text-xs text-dimmed">
              {{ props.subtitle }}
            </div>
          </div>
        </div>

        <div v-if="showMeta" class="truncate text-xs text-dimmed">
          <span v-if="props.meta">{{ props.meta }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import type { PropertyCard } from '../../../../composables/fireux/firestore/portfolio/property/utils/view/usePropertyInterface'

type Props = Pick<
  PropertyCard.Card,
  'to' | 'title' | 'subtitle' | 'meta' | 'imageUrl'
> & {
  showSubtitle?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showMeta: true,
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
