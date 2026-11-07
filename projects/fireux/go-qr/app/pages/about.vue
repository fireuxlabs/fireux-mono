<template>
  <UPage>
    <UButton to="/" variant="link"> Go QR </UButton>
    <UPageHeader
      title="About"
      description="Go QR turns public docs into QR pages."
    />
    <UPageBody>
      <section class="pagebody">
        <p class="fx-type-body">
          Upload a doc, choose a public path, and get a page people can open
          from a QR code.
        </p>

        <p class="fx-type-body">
          Go QR is part of the FireUX ecosystem and is designed for simple
          public information: text, links, notices, forms, and finished docs
          people need to scan and read.
        </p>
      </section>

      <div>
        <UButton to="/" icon="i-lucide-upload" size="lg">
          Create a QR doc
        </UButton>
      </div>
    </UPageBody>
  </UPage>
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
