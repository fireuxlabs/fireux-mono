<template>
  <KitchenCollectionList v-if="kitchenCards.length" :cards="kitchenCards" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCollectionRecord } from '../../../kitchen/composables/useKitchenCollection'
import { useKitchenInterface } from '../../../kitchen/composables/useKitchenInterface'

const props = defineProps<{ kitchens: KitchenCollectionRecord[] }>()
const { surface, interface: makeKitchenCard } = useKitchenInterface()
const kitchenCards = computed(() =>
  props.kitchens.flatMap((kitchen) => {
    const resolved = surface({ kitchen, place: kitchen.place })
    const card = resolved ? makeKitchenCard(resolved) : null
    return card ? [card] : []
  })
)
</script>
