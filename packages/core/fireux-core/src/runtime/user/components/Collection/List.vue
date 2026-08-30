<template>
  <ul class="collection-stack" aria-label="Users">
    <li v-for="card in cards" :key="card.to || card.id">
      <CollectionCell
        :title="card.displayName"
        :description="card.summary || card.handle"
        :to="card.to"
      />
    </li>
  </ul>
</template>
<script setup lang="ts">
import CollectionCell from '../../../components/Collection/Cell.vue'
import type { UserCard } from '../../composables/useUserInterface'
defineProps<{ cards: UserCard.Card[] }>()
</script>
