<template>
  <!-- Concurrent edit — 2026-07-21 15:55 CEST — Place onboarding live reconciliation: make this the sole Place creation funnel route. -->
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Add a Place"
      description="Find the real location, confirm its shared identity, and review it before it is added."
    />

    <UPageBody class="pagebody">
      <PlaceCreateSystem @created="onCreated" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { PlaceOnboardingResult } from '../../composables/fireux/place/usePlacesOnboarding'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Add Place',
  description: 'Confirm a shared Place through staged onboarding.',
  nav: {
    key: 'places-create',
    label: 'Add Place',
    icon: 'i-lucide-plus',
    order: 26,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Add Place' },
  name: 'PlacesCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Add Place` })

const router = useRouter()

async function onCreated(result: PlaceOnboardingResult) {
  if (!result.path.startsWith('/')) return
  await router.push(result.path)
}
</script>
