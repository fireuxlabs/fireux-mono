<template>
  <div>
    <header>
      <h2>Mise en place</h2>
      <p>
        Quantities for {{ dish?.spec?.portion || 1 }} portion{{
          dish?.spec?.portion === 1 ? '' : 's'
        }}. These are requirements, not available stock.
      </p>
    </header>
    <FireStateCard
      v-if="error"
      state="error"
      title="Prep items unavailable"
      :description="String(error)"
    />
    <p v-else-if="pending" role="status">Loading preparations…</p>
    <div v-else>
      <section v-for="group in groups" :key="group.station">
        <h3>{{ group.station }}</h3>
        <UPageGrid as="div">
          <UCard v-for="row in group.rows" :key="row.prep_item_id">
            <div class="card__header">
              <div>
                <h3>
                  {{ row.item?.name || row.prep_item_id }}
                </h3>
              </div>
              <UBadge color="neutral" variant="soft"
                >{{ row.quantity }} {{ row.unit }}</UBadge
              >
            </div>
            <p v-if="row.note">
              {{ row.note }}
            </p>
            <p v-if="!row.item">Preparation record unavailable.</p>
            <template v-else
              ><details>
                <summary>
                  Batch method · {{ row.item.yield.quantity }}
                  {{ row.item.yield.unit }}
                </summary>
                <ol>
                  <li v-for="step in row.item.method" :key="step">
                    {{ step }}
                  </li>
                </ol>
              </details>
              <UButton
                v-if="row.item.recipe_id"
                :to="`/workspace/kitchen/prep/recipes/${row.item.recipe_id}`"
                label="Open recipe"
                icon="i-lucide-book-open"
                color="neutral"
                variant="soft"
            /></template>
          </UCard>
        </UPageGrid>
      </section>
    </div>
    <UAlert
      v-if="!pending && !error && !rows.length"
      color="neutral"
      title="No mise en place linked"
      description="Add prep items in the dish specification."
    />
    <div>
      <UButton
        to="/workspace/kitchen/prep"
        label="Kitchen preparation"
        icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="outline"
      /><UButton
        to="/workspace/kitchen/prep/batches"
        label="Kitchen batches"
        color="neutral"
        variant="ghost"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenItemDetail } from '../../../composables/dish/useKitchenItemDetailContext'
import { useKitchenPrepItems } from '../../../composables/prep-item/useKitchenPrepItems'
const { dish, storageKitchenId, databaseId, rootCollection } =
  useKitchenItemDetail()
const { prepItems, pending, error } = useKitchenPrepItems(storageKitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const rows = computed(() =>
  (dish.value?.spec?.prep_items || []).map((row) => ({
    ...row,
    item: prepItems.value.find((item) => item.id === row.prep_item_id),
  }))
)
const groups = computed(() => {
  const result = new Map<string, typeof rows.value>()
  for (const row of rows.value) {
    const station = row.item?.station?.trim() || 'Station not assigned'
    const group = result.get(station) || []
    group.push(row)
    result.set(station, group)
  }
  return [...result].map(([station, rows]) => ({ station, rows }))
})
</script>
