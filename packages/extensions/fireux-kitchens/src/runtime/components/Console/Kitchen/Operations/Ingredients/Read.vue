<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Ingredients</h2>
            <p>Browse ingredients for the selected kitchen.</p>
          </div>

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <div v-if="cards.length" class="space-y-3">
        <IngredientCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="true"
        />
      </div>

      <p v-else class="text-sm text-dimmed">
        No ingredients found.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen ingredients"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIngredientInterface } from '../../../../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenConsoleIngredients'

const { ingredients, debug } = useKitchenConsoleIngredients()
const { cell } = useIngredientInterface()
const cards = computed(() =>
  ingredients.value
    .map((ingredient) => cell(ingredient))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
