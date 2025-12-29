<!-- FILE: packages/core/fireux-core/src/runtime/pages/apps/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <OrganismsAppCardsProfile :app="appProfile" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useRoute } from 'vue-router'
import { useAppFetch } from '../../composables/fireux/firestore/core/app/fetch/useAppFetch'
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const route = useRoute()

const appId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const { app: currentApp } = useAppFetch(appId)

const { profileProps } = useAppInterface()

const appProfile = computed(() =>
  currentApp.value ? profileProps(currentApp.value) : null
)

const appName = computed(() => currentApp.value?.app_name ?? null)
const pageTitle = computed(() => appName.value ?? 'App Details')
const pageDescription = computed(() =>
  appName.value
    ? `Inspect ${appName.value}, its overlays, and related apps.`
    : 'Inspect the selected app, its overlays, and related apps.'
)

const headTitle = computed(() =>
  appName.value ? `${appName.value} · App` : 'App Details'
)

useHead({ title: headTitle })
</script>
