<template>
  <FireActionSurface
    :to="link && record.to ? record.to : undefined"
    :action="action"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar
        :src="record.imageUrl || undefined"
        :alt="record.title"
        size="md"
      />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">{{ record.title }}</div>
            <div v-if="showSubtitle && record.subtitle" class="card__subtitle">
              {{ record.subtitle }}
            </div>
          </div>

          <div v-if="showBadges && record.badges?.length" class="card__badges">
            <UBadge
              v-for="badge in record.badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showMeta && metaText" class="card__subtitle">
          {{ metaText }}
        </div>

        <div v-if="showTagline && taglineText" class="card__subtitle">
          {{ taglineText }}
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductCard } from '../../composables/useProductInterface'

type Props = Partial<ProductCard.Card> & {
  card?: ProductCard.Card
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showMeta?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showMeta: true,
  showTagline: true,
  link: false,
  action: false,
})

const record = computed(() => props.card ?? props)
const metaText = computed(() => {
  const description = String(record.value.description || '').trim()
  const subtitle = String(record.value.subtitle || '').trim()
  if (!description) return ''
  return description === subtitle ? '' : description
})
const taglineText = computed(() =>
  String(props.prop || record.value.subtitle || '').trim()
)
</script>
