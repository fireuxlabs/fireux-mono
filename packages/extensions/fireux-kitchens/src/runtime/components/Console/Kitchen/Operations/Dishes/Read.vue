<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Dishes</h2>
            <p>Browse dishes for the selected kitchen.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <div v-if="cards.length" class="space-y-3">
        <DishCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No dishes found.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen dishes"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDishInterface } from '../../../../../composables/fireux/firestore/dish/useDish'
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'

const {
  dishes,
  debug,
} = useKitchenConsoleDishes()
const { cell } = useDishInterface()
const cards = computed(() =>
  dishes.value
    .map((dish) => cell(dish))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
