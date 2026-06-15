<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrProviderTools
      tool="doc"
      :payload="tool"
      class="mx-auto w-full max-w-xl"
    />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
const tool = {
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
})

const solution = {
  slug: 'doc',
  title: 'Doc',
  description: 'Upload a doc, choose a short path, and get a QR page.',
}

useSeoMeta({
  title: 'Doc - Go QR',
  ogTitle: 'Doc - Go QR',
  twitterTitle: 'Doc - Go QR',
  description: solution.description,
  ogDescription: solution.description,
  twitterDescription: solution.description,
})
</script>
