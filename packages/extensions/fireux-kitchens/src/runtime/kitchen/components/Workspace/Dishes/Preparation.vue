<template>
  <div class="grid gap-6">
    <header>
      <h2 class="text-xl font-semibold">Mise en place</h2>
      <p class="mt-1 text-sm text-muted">
        Quantities for {{ dish?.spec?.portion || 1 }} portion{{
          dish?.spec?.portion === 1 ? '' : 's'
        }}. These are requirements, not available stock.
      </p>
    </header>
    <MoleculesStateCard
      v-if="error"
      state="error"
      title="Prep items unavailable"
      :description="String(error)"
    />
    <p v-else-if="pending" role="status">Loading preparations…</p>
    <div v-else class="grid gap-7">
      <section v-for="group in groups" :key="group.station">
        <h3 class="font-semibold mb-3">{{ group.station }}</h3>
        <div class="grid gap-4 lg:grid-cols-2">
          <UCard v-for="row in group.rows" :key="row.prep_item_id">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-lg mt-1">
                  {{ row.item?.name || row.prep_item_id }}
                </h3>
              </div>
              <UBadge color="neutral" variant="soft"
                >{{ row.quantity }} {{ row.unit }}</UBadge
              >
            </div>
            <p v-if="row.note" class="mt-3 text-sm text-muted">
              {{ row.note }}
            </p>
            <p v-if="!row.item" class="mt-3 text-sm text-warning">
              Preparation record unavailable.
            </p>
            <template v-else
              ><details class="mt-4">
                <summary class="text-sm font-medium cursor-pointer">
                  Batch method · {{ row.item.yield.quantity }}
                  {{ row.item.yield.unit }}
                </summary>
                <ol class="list-decimal pl-5 mt-3 space-y-2 text-sm">
                  <li v-for="step in row.item.method" :key="step">
                    {{ step }}
                  </li>
                </ol>
              </details>
              <UButton
                v-if="row.item.recipe_id"
                :to="`/workspace/kitchen/food/recipes/${row.item.recipe_id}`"
                label="Open recipe"
                icon="i-lucide-book-open"
                color="neutral"
                variant="soft"
                class="mt-4"
            /></template>
          </UCard>
        </div>
      </section>
    </div>
    <UAlert
      v-if="!pending && !error && !rows.length"
      color="neutral"
      title="No mise en place linked"
      description="Add prep items in the dish specification."
    />
    <div class="border-t border-default pt-5 flex flex-wrap gap-3">
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
import { useKitchenWorkspaceDish } from '../../../composables/workspace/dishes/useKitchenWorkspaceDish'
import { useKitchenPrepItems } from '../../../composables/prep-item/useKitchenPrepItems'
const { dish, kitchenId, databaseId, rootCollection } =
  useKitchenWorkspaceDish()
const { prepItems, pending, error } = useKitchenPrepItems(kitchenId, {
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
