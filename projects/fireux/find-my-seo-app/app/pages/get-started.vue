<template>
  <UPage>
    <UButton to="/" variant="link"> Find My SEO </UButton>
    <UPageHeader
      title="Get Started"
      description="Create or browse SEO professional profiles."
    />
    <UPageBody>
      <section class="pagebody">
        <ol class="fx-list-stack">
          <li>Browse public SEO professional profiles.</li>
          <li>Compare services, sectors, and proof.</li>
          <li>Create a provider profile when you are ready to be listed.</li>
        </ol>
      </section>

      <div class="fx-card__actions">
        <UButton to="/get-started" icon="i-lucide-search" size="lg">
          Browse professionals
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Get Started - Find My SEO',
  description:
    'Get started with Find My SEO by browsing or creating public SEO professional profiles.',
})
</script>
