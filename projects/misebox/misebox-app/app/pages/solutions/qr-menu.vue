<template>
  <iframe
    :src="toolUrl"
    title="Go QR menu tool"
    class="mx-auto h-[34rem] w-full max-w-xl rounded-lg border border-default"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const consumer = {
  title: 'Menu',
  description: 'Upload a menu, choose a short path, and get a QR menu.',
  fileLabel: 'Menu file',
  pathLabel: 'Menu path',
  slugPlaceholder: 'my-menu',
  publicBaseUrl: 'https://misebox.app',
  publicPath: 'menus',
  publicPathSuffix: '/qr',
  accept: 'application/pdf,.doc,.docx',
  uploadHint: 'PDF, DOC, or DOCX. Max 10 MB.',
  ctaLabel: 'Create menu QR',
}

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: consumer.title,
    description: consumer.description,
    fileLabel: consumer.fileLabel,
    pathLabel: consumer.pathLabel,
    slugPlaceholder: consumer.slugPlaceholder,
    previewBaseUrl: `${consumer.publicBaseUrl}/${consumer.publicPath}`,
    previewPathSuffix: consumer.publicPathSuffix,
    accept: consumer.accept,
    uploadHint: consumer.uploadHint,
    ctaLabel: consumer.ctaLabel,
    loadingLabel: 'Creating menu...',
    openTargetLabel: 'Open menu',
  })

  return `${providerBaseUrl}/tools/doc?${query}`
})

useSeoMeta({
  title: 'QR menu',
  ogTitle: 'QR menu',
  twitterTitle: 'QR menu',
  description: 'hello world',
  ogDescription: 'hello world',
  twitterDescription: 'hello world',
})
</script>
