<template>
  <UPage>
    <UPageHeader title="Places" description="System Places" />
    <UPageBody class="pagebody">
      <OrganismsObjectsPlaceSearchSection
        :type="null"
        @confirmed="onPlaceCreated"
      />

      <OrganismsObjectsPlaceCollectionView :keyword="keyword" :title="pageTitle" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Places',
  description: 'Saved places.',
  nav: {
    key: 'places',
    label: 'Places',
    icon: 'i-lucide-map-pin',
    order: 25,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: 'Places' },
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Places` })

const route = useRoute()
const router = useRouter()

const keyword = computed<string | null>(() => {
  const raw = route.query.word
  const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  return value ? value : null
})

const pageTitle = computed(() => {
  if (!keyword.value) return 'Places'
  return `Places: ${keyword.value}`
})

async function onPlaceCreated() {
  // Nudge the route so the list refreshes immediately in dev.
  await router.replace({ query: { ...route.query } })
}
</script>

