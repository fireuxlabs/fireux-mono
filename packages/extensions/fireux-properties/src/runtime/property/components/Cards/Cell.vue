<template>
  <FireActionSurface
    :to="link && props.to ? props.to : undefined"
    :action="action"
    :disabled="disabled"
    class="block w-full"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
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
            <div
              v-if="showSubtitle && props.subtitle"
              class="truncate text-xs text-dimmed"
            >
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
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { PropertyCard } from '../../composables/firestore/utils/view/usePropertyInterface'

type Props = Pick<
  PropertyCard.Card,
  'to' | 'title' | 'subtitle' | 'meta' | 'imageUrl'
> & {
  showSubtitle?: boolean
  showMeta?: boolean
  link?: boolean
  action?: boolean
  disabled?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showMeta: true,
  link: false,
  action: false,
  disabled: false,
})
</script>
