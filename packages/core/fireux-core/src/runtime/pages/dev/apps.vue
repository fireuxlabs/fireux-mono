<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Debug and inspect each app section with its live data and developer utilities."
    />

    <UPageBody class="space-y-10">
      <!-- Current App -->
      <section class="space-y-4">
        <OrganismsAppSectionsSingle />
        <DevJsonPanel
          title="Dev · Current App"
          :data="currentAppDev"
          :default-open="hasCurrentApp"
        />
      </section>

      <!-- App Members -->
      <section class="space-y-4">
        <OrganismsAppSectionsSubcollection />
        <DevJsonPanel
          title="Dev · App Members"
          :data="appUsersDev"
          :default-open="hasAppMembers"
        />
      </section>

      <!-- App Collection -->
      <section class="space-y-4">
        <OrganismsAppSectionsCollection />
        <DevJsonPanel
          title="Dev · App Collection"
          :data="appCollectionDev"
          :default-open="hasCollection"
        />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useAppUsers } from 'fireux-core/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/apps'],
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
  title: 'Dev · Apps',
  description: 'Developer view for Apps with section-level dev panels.',
})

const { app, isInitialized } = useApp()
const { appUsers } = useAppUsers()
const { apps } = useAppCollection()

const isLoading = computed(() => app.value === undefined)
const appSnapshot = computed(() => app.value ?? null)
const appUsersList = computed(() => appUsers.value ?? [])
const appsList = computed(() => apps.value ?? [])

const currentAppDev = computed(() => ({
  flags: {
    isLoading: isLoading.value,
    isInitialized: isInitialized.value,
    hasApp: Boolean(appSnapshot.value),
  },
  app: appSnapshot.value,
}))

const appUsersDev = computed(() => ({
  total: appUsersList.value.length,
  members: appUsersList.value,
}))

const appCollectionDev = computed(() => ({
  total: appsList.value.length,
  apps: appsList.value,
}))

const hasCurrentApp = computed(() => Boolean(appSnapshot.value))
const hasAppMembers = computed(() => appUsersList.value.length > 0)
const hasCollection = computed(() => appsList.value.length > 0)
</script>
