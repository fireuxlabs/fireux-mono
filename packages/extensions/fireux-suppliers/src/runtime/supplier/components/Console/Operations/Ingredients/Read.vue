<template>
  <div class="space-y-6">
    <UAlert
      v-if="loadError"
      color="error"
      variant="soft"
      title="Ingredient details could not be loaded"
      description="The Supplier links are still intact, but their shared Ingredient details are temporarily unavailable."
    />

    <UAlert
      v-else-if="pending"
      color="neutral"
      variant="soft"
      title="Loading Ingredient details"
    />

    <UPageCard v-else>
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
          <div class="flex items-start gap-3">
            <UAvatar
              :src="card.imageUrl || undefined"
              icon="i-lucide-carrot"
              size="sm"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-highlighted">
                {{ card.title }}
              </p>
              <p class="truncate text-xs text-dimmed">
                {{ card.subtitle }}
              </p>
            </div>
            <UBadge
              v-if="card.warning"
              color="warning"
              variant="soft"
              size="xs"
            >
              {{ card.warning }}
            </UBadge>
          </div>
        </UPageCard>
      </div>
      <p v-else class="text-sm text-dimmed">
        No supplier ingredients found.
      </p>
    </UPageCard>

    <DevDebugPanel
      title="Supplier ingredients"
      scope="console"
      object-origin="fetched"
      :objects="{ ingredientItems }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleIngredients } from '../../../../composables/console/operations/Ingredients/useSupplierConsoleIngredients'
import { useSupplierIngredientInterface } from '../../../../composables/firestore/utils/view/useSupplierIngredientInterface'

const {
  ingredientItems,
  ingredientsTitle,
  ingredientsDescription,
  pending,
  loadError,
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
