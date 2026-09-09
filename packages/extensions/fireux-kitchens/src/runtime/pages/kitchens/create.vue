<!-- Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: make the public doorway authenticated and Place-backed. -->
<!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: route public Kitchen creation through its named funnel. -->
<template>
  <UPage>
    <UPageHeader
      title="Add a Kitchen"
      description="Find your kitchen or add a new one."
    />

    <UPageBody class="pagebody">
      <KitchenOnboarding mode="root" intent="directory" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Add Kitchen',
  description: 'Contribute a kitchen to the directory.',
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
