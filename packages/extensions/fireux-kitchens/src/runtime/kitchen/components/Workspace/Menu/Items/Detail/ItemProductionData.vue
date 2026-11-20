<template>
  <section aria-labelledby="item-production-heading">
    <h2 id="item-production-heading">Production</h2>
    <pre>{{ JSON.stringify(production, null, 2) }}</pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenItemContext } from '../../../../../composables/items/useKitchenItemContext'

const { document } = useKitchenItemContext()
const production = computed(() => {
  const source = document.value
  const spec = source?.spec as Record<string, unknown> | undefined
  return {
    preparations: Array.isArray(spec?.prep_items) ? spec.prep_items : null,
    recipes: Array.isArray(spec?.recipe_ids) ? spec.recipe_ids : null,
    ingredients: Array.isArray(spec?.ingredients) ? spec.ingredients : null,
    stationIds: Array.isArray(source?.preparation_station_ids)
      ? source.preparation_station_ids
      : null,
    stationNote:
      typeof spec?.station === 'string' ? spec.station || null : null,
    prepPlans: null,
    batches: null,
  }
})
</script>
