<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar :src="card.imageUrl || undefined" :alt="card.title" size="md" />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ card.title }}</div>

          <div v-if="showBadges && card.badges.length" class="preview__badges">
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

        <div v-if="showSubtitle && card.subtitle" class="preview__subtitle">
          {{ card.subtitle }}
        </div>

        <div v-if="showBody" class="preview__body">
          <div v-if="card.description" class="preview__line">
            {{ card.description }}
          </div>
          <div v-if="contentSnippet" class="preview__line">
            {{ contentSnippet }}
          </div>
          <div v-if="features.length" class="preview__meta">
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
          <div class="preview__line">
            <span v-if="prop">{{ prop }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'
import type { FirebaseProduct } from '../../../../../models/objects/product.model'
import { computed } from 'vue'

type Props = {
  card: ProductCard.Card
  product?: FirebaseProduct | null
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
