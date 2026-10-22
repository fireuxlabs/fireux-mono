<template>
  <UPage>
    <UPageHeader
      title="Install app"
      description="Install this app and manage optional offline support."
    />
    <UPageBody class="pagebody">
      <ClientOnly>
        <PwaControls />
        <template #fallback>
          <p class="text-sm text-muted">
            Open this page in a browser to manage installation and offline
            support.
          </p>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeo } from '../composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
  requiresAuth: false,
  robots: 'noindex, nofollow',
  sitemap: false,
  nav: { hidden: true },
})

useSeo({
  title: 'Install app',
  description: 'Install this app and manage optional offline support.',
  path: '/install',
  robots: 'noindex, nofollow',
})
</script>
