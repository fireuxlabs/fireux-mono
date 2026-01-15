<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Apps"
      description="Inspect the current app and browse all apps available to this runtime."
    />

    <UPageBody class="pagebody">
      <OrganismsAppCTA />

      <OrganismsAppCollectionManager :cards="appCards" :total="totalCount" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
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

useHead({ title: 'Apps' })

const { apps, count } = useAppCollection()
const { card: makeCard } = useAppInterface()

const appCards = computed(() =>
  (apps.value ?? [])
    .map((app) => makeCard(app))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const totalCount = computed(() => count.value ?? appCards.value.length)
</script>


