<!-- Concurrent edit — 2026-07-21 16:32 CEST — Place onboarding completion: describe identity, defaults, and optional branding. -->
<!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: route Place creation through the named domain funnel. -->
<template>
  <UPage>
    <UPageBody class="pagebody">
      <PlaceOnboarding @created="onCreated" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRouter } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { PlaceOnboardingResult } from '../../place/composables/usePlaceOnboarding'

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
