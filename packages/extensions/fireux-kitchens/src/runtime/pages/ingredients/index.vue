<!-- Concurrent edit — 2026-07-22 14:20 CEST — Ingredients public index pass: remove the create CTA from the public collection. -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <IngredientCollectionManager />
    </UPageBody>
  </UPage>
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
