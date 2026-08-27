<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Find My SEO </UButton>
        <UPageHeader
          title="Get Started"
          description="Create or browse SEO professional profiles."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <ol class="list-decimal fx-list-stack text-muted">
              <li>Browse public SEO professional profiles.</li>
              <li>Compare services, sectors, and proof.</li>
              <li>
                Create a provider profile when you are ready to be listed.
              </li>
            </ol>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/get-started" icon="i-lucide-search" size="lg">
              Browse professionals
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
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
