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
      <IngredientCTA :kitchen-id="runtimeKitchenId" :can-create="isAdmin" />
      <IngredientCollectionManager :collection="ingredients" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenDashboardSelection } from '../../composables/fireux/app/useKitchenDashboardSelection'
import { useKitchenIngredientFetch } from '../../composables/fireux/firestore/objects/ingredient/fetch/useKitchenIngredientFetch'

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
  name: 'KitchenIngredientsIndexPage',
})

const { runtimeKitchenId } = useKitchenDashboardSelection()
const { isAdmin } = useUser()
const { ingredients } = useKitchenIngredientFetch(runtimeKitchenId)

const pageTitle = 'Ingredients'
const pageDescription =
  'Create ingredients and browse inventory records for the active kitchen context.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
