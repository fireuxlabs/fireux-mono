<template>
  <UPage>
    <UButton to="/" variant="link"> Go QR </UButton>
    <UPageHeader
      title="Help"
      description="Upload a public doc and get a QR code."
    />
    <UPageBody>
      <section class="pagebody">
        <div>
          <h2 class="fx-type-section-title">How it works</h2>
          <p class="fx-type-body">
            Upload a doc, choose a short public path, then Go QR creates a
            public doc page and a printable QR page.
          </p>
        </div>

        <div>
          <h2 class="fx-type-section-title">Public by design</h2>
          <p class="fx-type-body">
            QR docs are for public information. Anyone with the link or QR code
            can view your doc.
          </p>
        </div>

        <div>
          <h2 class="fx-type-section-title">What to upload</h2>
          <p class="fx-type-body">
            Use Go QR for information people need to scan and read. Do not
            upload private, sensitive, or confidential information.
          </p>
        </div>
      </section>

      <div>
        <UButton to="/" icon="i-lucide-upload" size="lg">
          Create your first QR doc free
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'help',
    label: 'Help',
    icon: 'i-lucide-circle-help',
    order: 30,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Help - Go QR',
  ogTitle: 'Help - Go QR',
  twitterTitle: 'Help - Go QR',
  description:
    'How Go QR works: upload a public doc, get a public page and QR code.',
  ogDescription:
    'How Go QR works: upload a public doc, get a public page and QR code.',
  twitterDescription:
    'How Go QR works: upload a public doc, get a public page and QR code.',
})
</script>
