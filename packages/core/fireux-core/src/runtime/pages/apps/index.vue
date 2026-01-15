<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
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
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

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
  title: 'Apps',
  description: 'FireUX apps resolved for this runtime.',
  layout: 'default',
  name: 'AppsIndexPage',
  roles: ['global'],
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


