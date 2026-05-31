<template>
  <ProviderToolIframe
    :src="toolUrl"
    :title="title"
    :provider-origin="providerBaseUrl"
    message-source="go-qr"
    :initial-height="544"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  fileLabel?: string
  pathLabel?: string
  slugPlaceholder?: string
  previewBaseUrl?: string
  previewPathSuffix?: string
  createEndpoint?: string
  availabilityEndpoint?: string
  accept?: string
  uploadHint?: string
  ctaLabel?: string
  loadingLabel?: string
  openTargetLabel?: string
  takenMessage?: string
}>(), {
  title: 'Menu',
  description: 'Upload a menu, choose a short path, and get a QR menu.',
  fileLabel: 'Menu file',
  pathLabel: 'Menu path',
  slugPlaceholder: 'my-menu',
  previewBaseUrl: '',
  previewPathSuffix: '/qr',
  createEndpoint: '',
  availabilityEndpoint: '',
  accept: 'application/pdf,.doc,.docx',
  uploadHint: 'PDF, DOC, or DOCX. Max 10 MB.',
  ctaLabel: 'Create menu QR',
  loadingLabel: 'Creating menu...',
  openTargetLabel: 'Open menu',
  takenMessage: 'This menu path is already taken.',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: props.title,
    description: props.description,
    fileLabel: props.fileLabel,
    pathLabel: props.pathLabel,
    slugPlaceholder: props.slugPlaceholder,
    previewBaseUrl: props.previewBaseUrl,
    previewPathSuffix: props.previewPathSuffix,
    createEndpoint: props.createEndpoint,
    availabilityEndpoint: props.availabilityEndpoint,
    accept: props.accept,
    uploadHint: props.uploadHint,
    ctaLabel: props.ctaLabel,
    loadingLabel: props.loadingLabel,
    openTargetLabel: props.openTargetLabel,
    takenMessage: props.takenMessage,
  })

  return `${providerBaseUrl}/tools/doc?${query}`
})
</script>
