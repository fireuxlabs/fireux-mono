<template>
  <UPage>
        <UButton to="/" variant="link"> Sproochli </UButton>
        <UPageHeader
          title="Get Started"
          description="Create a QR-ready language surface for public visitor information."
        />
        <UPageBody>
          <section class="pagebody">
            <ol class="list-decimal fx-list-stack">
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
