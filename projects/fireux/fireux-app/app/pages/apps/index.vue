<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" />
    <UPageBody class="pagebody">
      <AppCTA />
      <AppCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'
import { computed } from 'vue'

definePageMeta({
  tag: 'apps',
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
  description: 'Current app and other apps in this ecosystem.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()
const pageTitle = 'Apps'

useHead({ title: `${appName} | ${pageTitle}` })

const { apps } = useAppCollection()
const collection = computed(() => apps.value ?? [])
</script>
