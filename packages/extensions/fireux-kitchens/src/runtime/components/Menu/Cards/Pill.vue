<template>
  <component
    :is="rootComponent"
    v-bind="rootAttrs"
    class="pill"
    @click="onClick"
  >
    <div class="flex min-w-0 items-start gap-2">
      <div class="shrink-0">
        <UAvatar
          :src="card.imageUrl || undefined"
          :alt="card.title || ''"
          size="sm"
          icon="i-lucide-book-open-check"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ card.title }}
        </p>
        <p
          v-if="showSubtitle && card.subtitle"
          class="truncate text-xs text-toned"
        >
          {{ card.subtitle }}
        </p>
        <span
          v-if="card.actionLabel"
          class="inline-flex w-fit items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-inverted"
        >
          {{ card.actionLabel }}
        </span>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { MenuCard } from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type MenuPillCard = Pick<
  MenuCard.Card,
  'to' | 'title' | 'subtitle' | 'imageUrl' | 'actionLabel'
>

type PillProps = {
  card: MenuPillCard
  showSubtitle?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<PillProps>(), {
  showSubtitle: true,
  link: false,
  action: false,
})

const rootComponent = computed(() =>
  props.link && props.card.to ? 'NuxtLink' : 'button'
)
const rootAttrs = computed(() =>
  props.link && props.card.to
    ? { to: props.card.to }
    : { type: 'button' }
)

const onClick = () => {
  if (props.action) {
    emit('action')
  }
}
</script>
