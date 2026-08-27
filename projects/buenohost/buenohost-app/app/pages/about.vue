<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> BuenoHost </UButton>
        <UPageHeader
          title="About"
          description="BuenoHost turns stay information into a digital guest guide."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <p class="text-muted">
              BuenoHost is a FireUX standalone app for simple guest guides,
              house information, local notes, and QR-ready stay companions.
            </p>

            <p class="text-muted">
              It starts small: one property, one guide, one QR surface. More
              property management features can grow from that clean base later.
            </p>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" icon="i-lucide-home" size="lg">
              Back to BuenoHost
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
  title: 'About - BuenoHost',
  description: 'BuenoHost turns stay information into a digital guest guide.',
})
</script>
