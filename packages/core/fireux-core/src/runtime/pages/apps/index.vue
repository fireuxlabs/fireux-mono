<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <EntityIndexCta
        title="Apps index"
        description="Browse canonical app records for the current ecosystem. Apps are managed as core ecosystem records, not as their own console runtime."
        family="console"
        source="apps collection"
        :count-label="`${collection.length} app${collection.length === 1 ? '' : 's'}`"
      />
      <AppCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection'

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
  description: 'Canonical app index for the current ecosystem.',
  layout: 'default',
  name: 'AppsIndexPage',
})

const { appName } = useFireUXConfig()

const pageTitle = 'Apps'
const pageDescription = 'Canonical app index for the current ecosystem.'

useHead({ title: `${appName} | ${pageTitle}` })

const { apps } = useAppCollection()
const collection = computed(() => apps.value ?? [])
</script>
