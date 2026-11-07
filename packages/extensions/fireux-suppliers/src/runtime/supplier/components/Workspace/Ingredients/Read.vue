<template>
  <div class="workspace-surface workspace-surface--compact">
    <UAlert
      v-if="outcome === 'error'"
      color="error"
      variant="soft"
      title="Ingredient details could not be loaded"
      description="Supplier ingredients could not be loaded."
    >
      <template #actions
        ><FireCopyError message="Supplier ingredients could not be loaded."
      /></template>
    </UAlert>

    <UAlert
      v-else-if="outcome === 'pending'"
      color="neutral"
      variant="soft"
      title="Loading Ingredient details"
    />

    <p v-else-if="outcome !== 'ready' && outcome !== 'empty'">
      Select an available Supplier to view ingredients.
    </p>
    <UPageCard v-else>
      <template #header>
        <div>
          <div>
            <h2 class="fx-type-section-title">
              {{ ingredientsTitle }}
            </h2>
            <p>
              {{ ingredientsDescription }}
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ cards.length }}
          </UBadge>
        </div>
      </template>

      <div
        v-if="cards.length"
        class="workspace-surface__grid workspace-surface__grid--2"
      >
        <UPageCard v-for="card in cards" :key="card.id" variant="subtle">
          <div>
            <UAvatar
              :src="card.imageUrl || undefined"
              icon="i-lucide-carrot"
              size="sm"
            />
            <div>
              <p>
                {{ card.title }}
              </p>
              <p>
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
      <p v-else>No supplier ingredients found.</p>
    </UPageCard>

    <FireDiagnosticsDebugPanel
      title="Supplier ingredients"
      scope="workspace"
      object-origin="fetched"
      :objects="{ ingredientItems }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierWorkspaceIngredients } from '../../../composables/workspace/ingredients/useSupplierWorkspaceIngredients'
import { useSupplierIngredientInterface } from '../../../composables/firestore/utils/view/useSupplierIngredientInterface'

const {
  ingredientItems,
  ingredientsTitle,
  ingredientsDescription,
  outcome,
  debug,
} = useSupplierWorkspaceIngredients()
const { cell } = useSupplierIngredientInterface()

const cards = computed(() =>
  ingredientItems.value
    .map((item) => cell(item))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
</script>
