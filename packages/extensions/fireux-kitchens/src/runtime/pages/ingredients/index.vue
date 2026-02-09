<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/kitchens"
        >
          Back to kitchens
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <IngredientCTA :can-create="isAdmin" />
      <IngredientCollectionManager :collection="ingredients" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useIngredientFetch } from '../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'

definePageMeta({
  layout: 'default',
  title: 'Ingredients',
  description: 'Global ingredient records resolved for this runtime.',
  nav: {
    key: 'ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'IngredientsIndexPage',
})

const { isAdmin } = useUser()
const { ingredients } = useIngredientFetch()

const pageTitle = 'Ingredients'
const pageDescription =
  'Create and browse global ingredient records for this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
