<!-- Ingredient creation stays in protected management; this route is the Directory. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody>
      <FireState
        :outcome="ingredientCollection.outcome"
        entity="ingredients"
        :error="ingredientCollection.error"
        retryable
        @retry="ingredientCollection.refresh()"
      />
      <IngredientCollection
        v-if="ingredientCollection.outcome === 'ready'"
        :ingredients="ingredientCollection.ingredients"
      />
    </UPageBody>
  </UPage>
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
