<template>
  <!-- Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: make the public doorway authenticated and Place-backed. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: route public Kitchen creation through its named funnel. -->
  <UPage>
    <UPageHeader
      title="Add a Kitchen"
      description="Choose its place, then add the Kitchen details you need."
    />

    <UPageBody class="pagebody">
      <KitchenOnboarding mode="public" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Add Kitchen',
  description: 'Create or connect a Place-backed Kitchen.',
  nav: {
    key: 'kitchens-create',
    label: 'Add Kitchen',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Add Kitchen' },
  name: 'KitchensCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Add Kitchen` })
</script>
