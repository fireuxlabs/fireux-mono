<template>
  <component
    :is="rootComponent"
    v-bind="rootAttrs"
    class="block w-full"
    @click="onClick"
  >
    <div
      class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3 transition hover:bg-[var(--ui-bg-elevated)]"
    >
      <div class="shrink-0">
        <UAvatar
          :src="card.imageUrl || undefined"
          :alt="card.title"
          icon="i-lucide-book-open-check"
          size="md"
        />
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold">{{ card.title }}</div>

            <div
              v-if="showSubtitle && card.subtitle"
              class="truncate text-xs text-dimmed"
            >
              {{ card.subtitle }}
            </div>
          </div>

          <span
            v-if="card.actionLabel"
            class="inline-flex shrink-0 items-center rounded-md bg-primary px-2 py-1 text-xs font-medium text-inverted"
          >
            {{ card.actionLabel }}
          </span>
        </div>

        <div
          v-if="showTagline && card.description"
          class="truncate text-xs text-dimmed"
        >
          <span>{{ card.description }}</span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuCard } from '../../../composables/fireux/firestore/menu/utils/view/useMenuInterface'

type MenuCellCard = Pick<
  MenuCard.Card,
  | 'to'
  | 'title'
  | 'subtitle'
  | 'actionLabel'
  | 'description'
  | 'imageUrl'
>

type Props = {
  card: MenuCellCard
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showTagline: true,
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
  if (props.action) emit('action')
}
</script>
