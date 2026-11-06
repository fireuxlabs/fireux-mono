<template>
  <UPage>
        <UButton to="/" variant="link"> Go QR </UButton>
        <UPageHeader
          title="Get Started"
          description="Create a public QR doc in one pass."
        />
        <UPageBody>
          <section class="pagebody">
            <ol class="list-decimal fx-list-stack">
              <li>Upload a public doc.</li>
              <li>Choose its public path.</li>
              <li>Create the QR page.</li>
            </ol>

            <p class="fx-type-caption">
              QR docs are public. Do not upload private, sensitive, or
              confidential information.
            </p>
          </section>

          <div class="flex flex-wrap gap-3">
            <UButton to="/" icon="i-lucide-qr-code" size="lg">
              Create your first QR doc
            </UButton>
          </div>
        </UPageBody>
      </UPage>
</template>

<script setup lang="ts">
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
  title: 'Get Started - Go QR',
  ogTitle: 'Get Started - Go QR',
  twitterTitle: 'Get Started - Go QR',
  description:
    'Create a public QR doc with Go QR: upload a doc, choose a public path, and create the QR page.',
  ogDescription:
    'Create a public QR doc with Go QR: upload a doc, choose a public path, and create the QR page.',
  twitterDescription:
    'Create a public QR doc with Go QR: upload a doc, choose a public path, and create the QR page.',
})
</script>
