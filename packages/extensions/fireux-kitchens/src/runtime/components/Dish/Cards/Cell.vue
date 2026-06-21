<template>
  <component
    :is="rootComponent"
    v-bind="rootAttrs"
    class="group block w-full rounded-2xl border border-default bg-default p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-elevated hover:shadow-md"
    @click="onClick"
  >
    <div class="flex items-start gap-3">
      <UAvatar
        :src="imageUrl || undefined"
        :alt="title"
        icon="i-lucide-utensils"
        size="lg"
        class="shrink-0 ring-1 ring-default"
      />

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate text-base font-semibold text-highlighted">
              {{ title || 'Untitled dish' }}
            </div>
            <div
              v-if="showSubtitle && subtitle"
              class="truncate text-xs text-muted"
            >
              {{ subtitle }}
            </div>
          </div>
        </div>

        <p
          v-if="showTagline"
          class="line-clamp-2 min-h-9 text-sm leading-5 text-dimmed"
          :class="{ italic: !description }"
        >
          {{ description || 'No description yet.' }}
        </p>

        <div class="flex items-center justify-between gap-3 pt-1 text-xs text-muted">
          <span class="truncate font-mono">{{ id }}</span>
          <span
            v-if="link && to"
            class="inline-flex items-center gap-1 font-medium text-primary"
          >
            Open dish
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3 transition group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { DishCard } from '../../../composables/fireux/firestore/dish/useDish'

type Props = Pick<
  DishCard.Card,
  'id' | 'to' | 'title' | 'subtitle' | 'imageUrl' | 'description' | 'meta'
> & {
  showSubtitle?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: false,
  showTagline: true,
  link: false,
  action: false,
})

const rootComponent = computed(() => props.link && props.to ? 'NuxtLink' : 'button')
const rootAttrs = computed(() =>
  props.link && props.to
    ? { to: props.to }
    : { type: 'button' }
)

const onClick = () => {
  if (props.action) emit('action')
}
</script>
