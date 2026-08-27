<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Go QR </UButton>
        <UPageHeader
          title="Help"
          description="Upload a public doc and get a QR code."
        />
        <UPageBody class="space-y-4">
          <section class="space-y-4">
            <div>
              <h2 class="text-xl font-semibold text-highlighted">
                How it works
              </h2>
              <p class="mt-2 text-muted">
                Upload a doc, choose a short public path, then Go QR creates a
                public doc page and a printable QR page.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-semibold text-highlighted">
                Public by design
              </h2>
              <p class="mt-2 text-muted">
                QR docs are for public information. Anyone with the link or QR
                code can view your doc.
              </p>
            </div>

            <div>
              <h2 class="text-xl font-semibold text-highlighted">
                What to upload
              </h2>
              <p class="mt-2 text-muted">
                Use Go QR for information people need to scan and read. Do not
                upload private, sensitive, or confidential information.
              </p>
            </div>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" icon="i-lucide-upload" size="lg">
              Create your first QR doc free
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
