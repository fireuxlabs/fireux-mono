<template>
  <ul class="collection-stack" aria-label="Properties">
    <li v-for="card in cards" :key="card.id">
      <CollectionCell
        :cell="{
          title: card.title,
          description: card.subtitle,
          image: card.imageUrl,
          meta: card.meta,
          badges: card.badges,
          to: card.to,
        }"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from 'fireux-core/runtime/components/Collection/Cell.vue'
type PropertyCard = { id: string; to: string; title: string; subtitle: string; meta: string; imageUrl: string; status: string; badges: string[]; summary: string }
defineProps<{ cards: PropertyCard[] }>()
</script>
