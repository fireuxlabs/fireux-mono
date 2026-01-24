<template>
  <div class="app-collection-grid">
    <OrganismsAppCardsPill
      v-for="item in cards"
      :key="item.id"
      :to="item.to || ''"
      :thumbnail-url="item.thumbnailUrl || ''"
      :display-name="item.displayName || ''"
      :ecosystem="item.ecosystem || ''"
      :badges="item.badges || []"
      :link="Boolean(item.to)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppInterface, type AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';
import type { AppModel } from '../../../../models/core/app.model';

const props = defineProps<{ collection?: AppModel[] }>()
const collectionSafe = computed(() => (props.collection ?? []).filter(Boolean))
const { card: makeCard } = useAppInterface()
const cards = computed<AppCard.Card[]>(() =>
  collectionSafe.value
    .map((item) => makeCard(item))
    .filter((item): item is AppCard.Card => Boolean(item))
)
</script>
