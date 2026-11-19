<template>
  <UCard
    class="kitchen-discovery-card"
    :ui="{ body: 'kitchen-discovery-card__body' }"
  >
    <PublicKitchenCollectionCardIdentity :cell="cell" />
    <div class="kitchen-discovery-card__details">
      <PublicKitchenCollectionCardLabels
        label="Keywords"
        :labels="cell.badges || []"
      />
      <PublicKitchenCollectionCardSpecial
        v-if="card.special"
        :special="card.special"
        :kitchen-path="card.to"
      />
      <PublicKitchenCollectionCardLabels
        label="Services"
        :labels="services"
        color="primary"
        variant="outline"
      />
      <UButton
        class="kitchen-discovery-card__action"
        :to="cell.to"
        label="View menus"
        trailing-icon="i-lucide-arrow-right"
        color="neutral"
        variant="soft"
        block
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import {
  toKitchenCollectionCell,
  type KitchenCollectionCard,
} from '../../../utils/kitchen-interface-projection'
const props = defineProps<{ card: KitchenCollectionCard }>()
const cell = computed(() => toKitchenCollectionCell(props.card))
const services = computed(() => [
  ...new Set(
    props.card.serviceLabels.filter((label) => label !== 'Browse menus')
  ),
])
</script>
<style scoped>
.kitchen-discovery-card {
  height: 100%;
  overflow: hidden;
}
:deep(.kitchen-discovery-card__body) {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.kitchen-discovery-card__details {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5);
  padding-top: 0;
}
.kitchen-discovery-card__action {
  margin-top: auto;
}
</style>
