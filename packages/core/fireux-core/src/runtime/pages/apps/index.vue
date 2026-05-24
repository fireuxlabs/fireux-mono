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
      <AppCollectionManager
        v-if="featuredApps.length"
        :collection="featuredApps"
        title="Featured apps"
        description="Selected app records for this app."
        :show-search="false"
        :show-variant-toggle="false"
        initial-variant="cell"
      />
      <AppCollectionManager
        :collection="collection"
        title="All apps"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppPublicSettings } from '../../composables/fireux/app/useAppPublicSettings'
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import type { AppModel } from '../../models/core/app.model'

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
const { featuredAppSlugs } = useAppPublicSettings()
const collection = computed(() => apps.value ?? [])
const clean = (value: unknown) => String(value ?? '').trim()
const featuredApps = computed(() => {
  const bySlug = new Map(
    collection.value.map((entry) => [clean(entry.slug), entry])
  )

  return featuredAppSlugs.value
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is AppModel => Boolean(entry))
})
</script>
