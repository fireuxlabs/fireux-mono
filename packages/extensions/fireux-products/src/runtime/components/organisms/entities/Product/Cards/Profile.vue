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
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'
import type { FirebaseProduct } from '../../../../../models/objects/product.model'

const { card, avatar: avatarProp, prop, product } = defineProps<{
  card: ProductCard.Card
  avatar?: string | null
  prop?: string
  product?: FirebaseProduct | null
}>()

const title = card.title || card.name
const subtitle = card.subtitle || card.description
const avatar = avatarProp ?? card.avatarUrl ?? card.imageUrl ?? null
const description = card.description || product?.description || ''
const content = product?.content ? String(product.content).trim() : ''
const features =
  product?.features?.map((feature) => feature.title).filter(Boolean) ?? []
</script>
