<!-- Ingredient creation stays in protected management; this route is the Directory. -->
<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-carrot"
  >
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
    />
  </CollectionPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useIngredientCollection } from '../../ingredient/composables/useIngredientCollection'
const ingredientCollection = reactive(useIngredientCollection())

import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Ingredients',
  description: 'Browse global ingredients.',
  tag: 'ingredients',
  nav: {
    key: 'ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 55,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'IngredientsIndexPage',
})

const pageTitle = 'Ingredients'
const pageDescription =
  'Browse ingredients kitchens can use in recipes, menus, and stock.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
