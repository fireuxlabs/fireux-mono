<!-- Ingredient creation stays in protected management; this route is the Directory. -->
<template>
  <DirectorySurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-carrot"
  >
    <IngredientCollectionManager />
  </DirectorySurface>
</template>

<script setup lang="ts">
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
