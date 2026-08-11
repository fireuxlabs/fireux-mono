<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            My Kitchen Apps
          </h2>
          <p class="mt-1 text-sm text-dimmed">
            Tenant Apps containing Kitchens you can access.
          </p>
        </div>
        <UBadge color="neutral" variant="soft">
          {{ cards.length }}
        </UBadge>
      </div>
    </template>

    <div class="grid gap-3 lg:grid-cols-2">
      <div
        v-for="item in cards"
        :key="item.card.id"
        class="rounded-lg border border-default p-3"
      >
        <AppCardsCell
          v-bind="item.card"
          link
          :show-badges="false"
          :show-meta="false"
        />
        <p class="mt-2 text-xs text-dimmed">
          {{ item.kitchenNames.join(' · ') }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/app/useAppInterface'
import type { KitchenConsoleAppTargetItem } from '../../../../models/kitchen/kitchen-index.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenConsoleAppTargetItem[]
  }>(),
  {
    collection: () => [],
  }
)

const { cell } = useAppInterface()
const cards = computed(() =>
  props.collection.flatMap((item) => {
    const card = cell({
      ...item.app,
      detail_url: `/apps/${encodeURIComponent(item.app.id)}`,
    })
    return card
      ? [{
          card,
          kitchenNames: item.kitchens.map(kitchen => kitchen.name),
        }]
      : []
  })
)
</script>
