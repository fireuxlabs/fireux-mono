<template>
  <ul class="collection-stack" aria-label="Projects">
    <li v-for="card in cards" :key="card.to">
      <CollectionCell
        :title="card.title"
        :description="card.subtitle"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from '../../../components/Collection/Cell.vue'
export type ProjectCollectionCard = {
  to: string
  title: string
  subtitle?: string
  imageUrl?: string
}
defineProps<{ cards: ProjectCollectionCard[] }>()
</script>
