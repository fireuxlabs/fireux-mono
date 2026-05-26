<template>
  <main class="min-h-screen bg-default text-default" data-entity-cta-family="utility-managed">
    <UContainer class="py-8 sm:py-10">
      <header class="mx-auto mb-6 max-w-xl space-y-3">
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Go QR
        </h1>
        <p class="text-base text-muted sm:text-lg">
          Create scannable public links for docs, menus, guides, forms, and more.
        </p>
      </header>

      <p class="mx-auto max-w-xl text-xs font-semibold uppercase text-muted">
        below here
      </p>

      <ClientOnly>
        <GoQrProviderPublicDocTool class="mx-auto max-w-xl" />
      </ClientOnly>

      <p class="mx-auto max-w-xl text-xs font-semibold uppercase text-muted">
        above here
      </p>

      <LandingSolutions variant="preview" />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Go QR - Scannable public links',
  ogTitle: 'Go QR - Scannable public links',
  twitterTitle: 'Go QR - Scannable public links',
  description: 'Create scannable public links for docs, menus, guides, forms, and more.',
  ogDescription: 'Create scannable public links for docs, menus, guides, forms, and more.',
  twitterDescription: 'Create scannable public links for docs, menus, guides, forms, and more.',
})
</script>
