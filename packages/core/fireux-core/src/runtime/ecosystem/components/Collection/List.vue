<template>
  <ul class="collection-stack" aria-label="Ecosystems">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.title"
        :description="card.subtitle || card.meta"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from '../../../components/Collection/Cell.vue'
import type { EcosystemInterfaceCard } from '../../composables/useEcosystemInterface'
defineProps<{ cards: EcosystemInterfaceCard[] }>()
</script>
