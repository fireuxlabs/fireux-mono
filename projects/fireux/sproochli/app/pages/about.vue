<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Sproochli </UButton>
        <UPageHeader
          title="About"
          description="Sproochli is the FireUX language layer for public visitor information."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <p class="text-muted">
              Sproochli helps hospitality and local businesses publish
              visitor-facing information that can later be translated,
              localised, and shared by QR code.
            </p>

            <p class="text-muted">
              It is designed to sit alongside FireUX apps such as Misebox,
              BuenoHost, and Go QR instead of becoming a separate custom website
              every time.
            </p>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" icon="i-lucide-home" size="lg">
              Back to Sproochli
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
  title: 'About - Sproochli',
  description:
    'Sproochli is the FireUX language layer for public visitor information.',
})
</script>
