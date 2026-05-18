<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription">
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
      <OrganismsIngredientCTA :can-create="isAdmin" />
      <OrganismsIngredientCollectionManager
        :collection="ingredients"
        title="Ingredients"
        description="Browse canonical ingredient records shared across kitchens in this runtime."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useIngredientCollection } from '../../composables/fireux/firestore/ingredient/fetch/useIngredientCollection'

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

const { isAdmin } = useUser()
const { ingredients } = useIngredientCollection()

const pageTitle = 'Ingredients'
const pageDescription =
  'Canonical ingredient index for the current runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
