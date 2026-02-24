<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue -->
<template>
  <UPage>
    <UPageHeader class="border-b-0" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <RecipeCTA />
      <RecipeCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'

const pageTitle = 'Recipes'
const pageDescription = 'Browse recipes available to this runtime.'

definePageMeta({
  layout: 'default',
  title: pageTitle,
  description: pageDescription,
  nav: {
    key: 'recipes',
    label: 'Recipes',
    icon: 'i-lucide-book-open',
    order: 47,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'RecipesIndexPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const collection = computed(() => [])
</script>
