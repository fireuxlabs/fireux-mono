<template>
  <ProviderToolIframe
    :src="toolUrl"
    :title="title"
    :provider-origin="providerBaseUrl"
    :auth-token="authToken"
    message-source="go-qr"
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
  authToken?: string
}>(), {
  title: 'Doc',
  description: 'Upload a doc, choose a short path, and get a QR.',
  fileLabel: 'Doc file',
  pathLabel: 'Doc path',
  slugPlaceholder: 'my-doc',
  previewBaseUrl: '',
  previewPathSuffix: '/qr',
  createEndpoint: '',
  availabilityEndpoint: '',
  accept: 'application/pdf,image/*,.doc,.docx',
  uploadHint: 'PDF, image, DOC, or DOCX. Max 10 MB.',
  ctaLabel: 'Create doc QR',
  loadingLabel: 'Creating doc...',
  openTargetLabel: 'Open doc',
  takenMessage: 'This doc path is already taken.',
  authToken: '',
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
