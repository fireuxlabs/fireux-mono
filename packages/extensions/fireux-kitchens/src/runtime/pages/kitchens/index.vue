<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
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
          to="/ingredients"
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
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h2 class="text-base font-semibold">Kitchen Operations</h2>
            <p class="text-xs text-dimmed">
              Run back-of-house workflows with consistent kitchen records.
            </p>
          </div>
        </template>

        <div class="flex flex-wrap gap-2">
          <UBadge variant="soft" color="neutral">Menus</UBadge>
          <UBadge variant="soft" color="neutral">Ingredients</UBadge>
          <UBadge variant="soft" color="neutral">Mise en Place</UBadge>
          <UBadge variant="soft" color="neutral">Team</UBadge>
          <UBadge variant="soft" color="neutral">Costs</UBadge>
        </div>
      </UCard>

      <KitchenCTA />
      <KitchenCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'

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
  description: 'Kitchen operations pages and dashboards for this runtime.',
  layout: 'default',
  name: 'KitchensIndexPage',
})

const pageTitle = 'Kitchens'
const pageDescription =
  'Kitchen operations pages and dashboards for menus, ingredients, mise, team, and costs.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { kitchens } = useKitchenFetch()

const collection = computed(() => kitchens.value ?? [])
</script>
