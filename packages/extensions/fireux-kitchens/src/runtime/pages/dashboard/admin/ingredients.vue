<template>
  <UPage>
    <UPageHeader
      title="Ingredients"
      description="Curate the shared Ingredient world used by Kitchen and Supplier operations."
    >
      <template #ctas>
        <UButton to="/ingredients/add" icon="i-lucide-plus" size="sm">
          Add Ingredient
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <MoleculesStateCard
        v-if="ingredientCollection.outcome === 'pending'"
        entity="Ingredient"
        kind="collection"
        loading
      />
      <MoleculesStateCard
        v-else-if="ingredientCollection.outcome === 'error'"
        entity="Ingredient"
        kind="collection"
        state="error"
      >
        <template #actions>
          <UButton
            label="Try again"
            variant="soft"
            @click="ingredientCollection.refresh()"
          />
        </template>
      </MoleculesStateCard>
      <IngredientCollection
        v-else
        :ingredients="ingredientCollection.ingredients"
        title="Canonical library"
        description="All active, deprecated, and merged Ingredient roots. Open one to edit, reactivate, retire, or merge it."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useIngredientCollection } from '../../../ingredient/composables/useIngredientCollection'
const ingredientCollection = reactive(
  useIngredientCollection({ includeInactive: true })
)

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'ingredients',
    domain: 'ingredients',
    label: 'Ingredients',
    description: 'Curate the canonical Ingredient library.',
    icon: 'i-lucide-carrot',
    order: 140,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
