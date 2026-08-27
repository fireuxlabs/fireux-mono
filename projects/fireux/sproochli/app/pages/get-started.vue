<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Sproochli </UButton>
        <UPageHeader
          title="Get Started"
          description="Create a QR-ready language surface for public visitor information."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <ol class="list-decimal fx-list-stack text-muted">
              <li>Choose the public content you want visitors to scan.</li>
              <li>Publish a simple QR-ready page.</li>
              <li>Add translation when the content is ready for it.</li>
            </ol>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/menus" icon="i-lucide-languages" size="lg">
              View menu examples
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
  title: 'Get Started - Sproochli',
  description:
    'Start with Sproochli by publishing QR-ready visitor information and adding translation when the content is ready.',
})
</script>
