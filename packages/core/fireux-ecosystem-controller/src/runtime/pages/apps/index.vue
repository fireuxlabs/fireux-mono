<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsAppCTA />
      <OrganismsAppCollectionManager :cards="cards" :total="total" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { computed } from 'vue'

definePageMeta({
  nav: {
    key: 'apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  tenant: 'global',
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Apps'
const pageDescription =
  'Inspect the current app and browse all apps available to this runtime.'

useHead({ title: `${appName} | ${pageTitle}` })

const { apps, count } = useAppCollection()
const { card: makeCard } = useAppInterface()

const cards = computed(() =>
  (apps.value ?? [])
    .map((app) => makeCard(app))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() => count.value ?? cards.value.length)
</script>
