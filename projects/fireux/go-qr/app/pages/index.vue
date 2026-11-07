<template>
  <UPage data-entity-cta-family="utility-managed">
    <UContainer>
      <header class="pagebody">
        <h1 class="fx-type-page-title">Go QR</h1>
        <p class="fx-type-body">
          Create scannable public links for text, docs, forms, contact actions,
          and more.
        </p>
      </header>

      <section>
        <GoQrProviderTools tool="doc" :payload="docTool" />
      </section>

      <FireLandingSolutions
        variant="preview"
        :limit="99"
        title="What do you need a QR code for?"
        subtitle="Pick the thing people should open, save, join, or contact after they scan."
        always-show-more-button
      />
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
const docTool = {
  copy: {
    title: 'Doc',
    description: 'Upload a doc, choose a short path, and get a QR page.',
    ctaLabel: 'Create doc QR',
    loadingLabel: 'Creating doc...',
    openTargetLabel: 'Open doc',
  },
  upload: {
    fileLabel: 'Doc file',
    accept: 'application/pdf,image/*,.doc,.docx',
    hint: 'PDF, image, DOC, or DOCX. Max 10 MB.',
  },
  slug: {
    label: 'Doc path',
    placeholder: 'doc-path',
    initialValue: '',
    takenMessage: 'This doc path is already taken.',
  },
  preview: {
    baseUrl: '/doc',
    pathSuffix: '/qr',
    message: '',
  },
  endpoints: {
    create: '/api/tools/doc/create',
    availability: '/api/tools/doc/availability',
  },
}

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Go QR - Scannable public links',
  ogTitle: 'Go QR - Scannable public links',
  twitterTitle: 'Go QR - Scannable public links',
  description:
    'Create scannable public links for text, docs, forms, contact actions, and more.',
  ogDescription:
    'Create scannable public links for text, docs, forms, contact actions, and more.',
  twitterDescription:
    'Create scannable public links for text, docs, forms, contact actions, and more.',
})
</script>
