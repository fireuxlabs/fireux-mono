<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Find My SEO </UButton>
        <UPageHeader
          title="About"
          description="Find My SEO helps people discover SEO professionals."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <p class="text-muted">
              Find My SEO is a FireUX standalone app for public SEO profiles,
              services, and discovery surfaces.
            </p>

            <p class="text-muted">
              The first version focuses on profile and directory pages before
              adding heavier marketplace mechanics.
            </p>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/get-started" icon="i-lucide-users" size="lg">
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
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'About - Find My SEO',
  description: 'Find My SEO helps people discover SEO professionals.',
})
</script>
