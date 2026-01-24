<template>
  <div v-if="variant === 'pill'" class="collection-grid">
    <OrganismsAppCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      :to="item.to"
      :thumbnail-url="item.thumbnailUrl"
      :display-name="item.displayName"
      :ecosystem="item.ecosystem"
      :badges="item.badges"
      :link="Boolean(item.to)"
    />
  </div>

  <div v-else class="collection-stack">
    <OrganismsAppCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      :to="item.to"
      :thumbnail-url="item.thumbnailUrl"
      :display-name="item.displayName"
      :badges="item.badges"
      :tagline="item.tagline"
      :user-count="item.userCount"
      :link="Boolean(item.to)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';

withDefaults(
  defineProps<{
    cards: AppCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)

</script>
