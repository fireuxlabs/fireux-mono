<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsAppCTA />
      <OrganismsAppCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
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

const { apps } = useAppCollection()
const collection = computed(() => apps.value ?? [])
</script>


