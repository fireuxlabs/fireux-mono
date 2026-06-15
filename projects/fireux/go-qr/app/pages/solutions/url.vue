<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrProviderTools
      tool="url"
      :payload="tool"
      class="mx-auto w-full max-w-xl"
    />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
const tool = {
  copy: {
    title: 'URL',
    description: 'Create a QR code from any public URL.',
    ctaLabel: 'Create URL QR',
    downloadLabel: 'Download QR',
    openTargetLabel: 'Open URL',
  },
  url: {
    label: 'URL',
    placeholder: 'https://example.com',
    initialValue: '',
    invalidMessage: 'Enter a valid public URL.',
  },
  qr: {
    centreLabel: '',
  },
}

definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'url',
  title: 'URL',
  description: 'Create a QR code from any public URL.',
}

useSeoMeta({
  title: 'URL - Go QR',
  description: solution.description,
})
</script>
