<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Go QR </UButton>
        <UPageHeader
          title="About"
          description="Go QR turns public docs into QR pages."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <p class="text-muted">
              Upload a doc, choose a public path, and get a page people can open
              from a QR code.
            </p>

            <p class="text-muted">
              Go QR is part of the FireUX ecosystem and is designed for simple
              public information: text, links, notices, forms, and finished docs
              people need to scan and read.
            </p>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" icon="i-lucide-upload" size="lg">
              Create a QR doc
            </UButton>
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
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
  title: 'About - Go QR',
  ogTitle: 'About - Go QR',
  twitterTitle: 'About - Go QR',
  description:
    'Go QR turns public docs into QR pages and is part of the FireUX ecosystem.',
  ogDescription:
    'Go QR turns public docs into QR pages and is part of the FireUX ecosystem.',
  twitterDescription:
    'Go QR turns public docs into QR pages and is part of the FireUX ecosystem.',
})
</script>
