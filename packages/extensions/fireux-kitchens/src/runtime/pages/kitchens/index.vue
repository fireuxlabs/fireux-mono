<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          color="primary"
          icon="i-lucide-chef-hat"
          :to="kitchenDashboardTo"
        >
          Kitchen dashboard
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-book-open"
          to="/kitchens/learn-more"
        >
          Learn more
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-carrot"
          :to="ingredientsRoute"
        >
          Ingredients
        </UButton>
        <UButton
          size="xs"
          color="primary"
          icon="i-lucide-users"
          to="/chefs"
        >
          Chef profiles
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <KitchenCTA />
      <KitchenCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useKitchenDashboardSelection } from '../../composables/fireux/app/useKitchenDashboardSelection'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'

definePageMeta({
  nav: {
    key: 'kitchens',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Kitchens',
  description: 'Runtime kitchen selection and dashboard launch.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'
const pageDescription = ''

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()
const { runtimeKitchenId } = useKitchenDashboardSelection()

const collection = computed(() => kitchens.value ?? [])

const kitchenDashboardTo = computed(() =>
  runtimeKitchenId.value
    ? {
        path: '/dashboard/kitchen',
        query: { kitchenId: runtimeKitchenId.value },
      }
    : '/dashboard/kitchen'
)

const ingredientsRoute = computed(() =>
  runtimeKitchenId.value
    ? {
        path: '/dashboard/kitchen/ingredients',
        query: { kitchenId: runtimeKitchenId.value },
      }
    : '/dashboard/kitchen/ingredients'
)
</script>
