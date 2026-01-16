<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="imageUrl || undefined" :alt="name" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ name }}</div>
            <div v-if="showSubtitle && subtitle" class="fx-cell__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-cell__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="fx-cell__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'

type Props = Pick<ProductCard.Card, 'to' | 'name' | 'description' | 'imageUrl' | 'badges'> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
})

const subtitle = props.description
</script>
