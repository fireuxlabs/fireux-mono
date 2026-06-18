<template>
  <div class="space-y-6">
    <UPageCard>
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ ingredientsTitle }}
            </h2>
            <p class="text-sm text-dimmed">
              {{ ingredientsDescription }}
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ cards.length }}
          </UBadge>
        </div>
      </template>

      <div v-if="cards.length" class="grid gap-3 md:grid-cols-2">
        <UPageCard
          v-for="card in cards"
          :key="card.id"
          variant="subtle"
        >
          <p class="text-sm font-semibold text-highlighted">
            {{ card.title }}
          </p>
          <p class="text-xs text-dimmed">
            {{ card.subtitle }}
          </p>
        </UPageCard>
      </div>
      <p v-else class="text-sm text-dimmed">
        No supplier ingredients found.
      </p>
    </UPageCard>

    <DevFireuxDebugPanel
      title="Supplier ingredients"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleIngredients } from '../../../../../composables/fireux/console/supplier/operations/Ingredients/useSupplierConsoleIngredients'
import { useSupplierIngredientInterface } from '../../../../../composables/fireux/firestore/supplier/utils/view/useSupplierIngredientInterface'

const {
  ingredientItems,
  ingredientsTitle,
  ingredientsDescription,
  debug,
} = useSupplierConsoleIngredients()
const { cell } = useSupplierIngredientInterface()

const cards = computed(() =>
  ingredientItems.value
    .map((item) => cell(item))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
