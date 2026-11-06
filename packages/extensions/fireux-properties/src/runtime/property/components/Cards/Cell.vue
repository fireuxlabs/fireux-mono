<template>
  <FireActionSurface
    :to="link && props.to ? props.to : undefined"
    :action="action"
    :disabled="disabled"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="props.imageUrl || undefined"
        :alt="props.title"
        size="md"
        icon="i-lucide-building"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">{{ props.title }}</div>
            <div v-if="showSubtitle && props.subtitle" class="card__subtitle">
              {{ props.subtitle }}
            </div>
          </div>
        </div>

        <div v-if="showMeta" class="card__subtitle">
          <span v-if="props.meta">{{ props.meta }}</span>
          <span v-else class="fx-card__tagline--empty">missing</span>
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
