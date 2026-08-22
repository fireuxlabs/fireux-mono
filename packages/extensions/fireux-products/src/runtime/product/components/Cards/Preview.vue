<template>
  <UCard class="preview transition-colors hover:bg-primary/5 hover:border-primary/30">
    <div class="preview__row flex gap-4">
      <UAvatar :src="card.imageUrl || undefined" :alt="card.title" size="md" />

      <div class="preview__main flex-1 space-y-2">
        <div class="preview__top flex items-start justify-between gap-3">
          <div class="preview__title text-base font-semibold">
            {{ card.title }}
          </div>

          <div
            v-if="showBadges && card.badges.length"
            class="preview__badges flex flex-wrap items-center justify-end gap-1"
          >
            <UBadge
              v-for="badge in card.badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="showSubtitle && card.subtitle"
          class="preview__subtitle text-sm text-muted"
        >
          {{ card.subtitle }}
        </div>

        <div v-if="showBody" class="preview__body space-y-2 text-sm">
          <div v-if="card.description" class="preview__line text-muted">
            {{ card.description }}
          </div>
          <div v-if="contentSnippet" class="preview__line text-muted">
            {{ contentSnippet }}
          </div>
          <div v-if="features.length" class="preview__meta flex flex-wrap gap-1">
            <UBadge
              v-for="feature in features"
              :key="feature"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ feature }}
            </UBadge>
          </div>
          <div class="preview__line fx-type-label">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductCard } from '../../composables/useProductInterface'
import type { Product } from '../../utils/product.ts'

type Props = {
  card: ProductCard.Card
  product?: Product | null
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showBadges: true,
  showBody: true,
})

const contentSnippet = computed(() => {
  const content = props.product?.content
  if (!content) return ''
  const cleaned = String(content).replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  return cleaned.length > 140 ? `${cleaned.slice(0, 140)}…` : cleaned
})

const features = computed(() =>
  props.product?.features?.map((feature) => feature.title).filter(Boolean).slice(0, 3) ?? []
)
</script>
