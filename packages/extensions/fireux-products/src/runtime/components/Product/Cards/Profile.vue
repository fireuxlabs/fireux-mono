<template>
  <UCard class="profile">
    <div class="profile__header">
      <div class="profile__identity">
        <UAvatar :src="avatar || undefined" :alt="title" size="md" />
        <div class="profile__titles">
          <div class="profile__title">{{ title }}</div>
          <div v-if="subtitle" class="profile__subtitle">{{ subtitle }}</div>
        </div>
      </div>

      <div v-if="card.badges.length" class="profile__badges">
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

    <div class="profile__body">
      <div class="profile__section">
        <div class="profile__label">Overview</div>
        <div class="profile__value">{{ description }}</div>
      </div>

      <div v-if="content" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">{{ content }}</div>
      </div>

      <div v-if="features.length" class="profile__section">
        <div class="profile__label">Includes</div>
        <div class="profile__value">
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="feature in features" :key="feature">{{ feature }}</li>
          </ul>
        </div>
      </div>

      <div v-if="prop" class="profile__section">
        <div class="profile__label">Meta</div>
        <div class="profile__value">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductCard } from '../../../composables/fireux/product/useProductInterface'
import type { FirebaseProduct } from '../../../models/product.model'

const props = defineProps<{
  card: ProductCard.Card
  avatar?: string | null
  prop?: string
  product?: FirebaseProduct | null
}>()

const title = computed(() => props.card.title)
const subtitle = computed(() => props.card.subtitle || undefined)
const avatar = computed(() => props.avatar ?? props.card.avatarUrl ?? null)
const description = computed(() => props.card.description)
const content = computed(() =>
  props.product?.content ? String(props.product.content).trim() : ''
)
const features = computed(
  () => props.product?.features?.map((feature) => feature.title).filter(Boolean) ?? []
)
</script>
