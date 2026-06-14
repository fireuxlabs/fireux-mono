<template>
  <section class="space-y-2">
    <div v-if="isDev" class="flex justify-end">
      <UBadge color="neutral" variant="soft" size="sm">
        Go QR: {{ providerModeLabel }}
      </UBadge>
    </div>

    <ProviderToolIframe
      :src="toolUrl"
      :title="resolved.title"
      :provider-origin="providerBaseUrl"
      :auth-token="resolved.authToken"
      message-source="go-qr"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type GoQrDocToolConfig = {
  authToken?: string
  copy?: {
    title?: string
    description?: string
    ctaLabel?: string
    loadingLabel?: string
    openTargetLabel?: string
  }
  upload?: {
    fileLabel?: string
    accept?: string
    hint?: string
  }
  slug?: {
    label?: string
    placeholder?: string
    takenMessage?: string
  }
  preview?: {
    baseUrl?: string
    pathSuffix?: string
  }
  endpoints?: {
    create?: string
    availability?: string
  }
}

const props = withDefaults(defineProps<{
  tool?: GoQrDocToolConfig | null
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
  providerBaseUrl?: string
}>(), {
  tool: null,
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
  providerBaseUrl: 'https://go-qr.web.app',
})

const providerBaseUrl = computed(() =>
  props.providerBaseUrl.replace(/\/+$/, '')
)
const isDev = import.meta.dev
const providerModeLabel = computed(() =>
  providerBaseUrl.value.includes('localhost') ||
  providerBaseUrl.value.includes('127.0.0.1')
    ? 'local dev'
    : 'deployed'
)
const resolved = computed(() => ({
  title: props.tool?.copy?.title || props.title,
  description: props.tool?.copy?.description || props.description,
  fileLabel: props.tool?.upload?.fileLabel || props.fileLabel,
  pathLabel: props.tool?.slug?.label || props.pathLabel,
  slugPlaceholder: props.tool?.slug?.placeholder || props.slugPlaceholder,
  previewBaseUrl: props.tool?.preview?.baseUrl || props.previewBaseUrl,
  previewPathSuffix: props.tool?.preview?.pathSuffix ?? props.previewPathSuffix,
  createEndpoint: props.tool?.endpoints?.create || props.createEndpoint,
  availabilityEndpoint: props.tool?.endpoints?.availability || props.availabilityEndpoint,
  accept: props.tool?.upload?.accept || props.accept,
  uploadHint: props.tool?.upload?.hint || props.uploadHint,
  ctaLabel: props.tool?.copy?.ctaLabel || props.ctaLabel,
  loadingLabel: props.tool?.copy?.loadingLabel || props.loadingLabel,
  openTargetLabel: props.tool?.copy?.openTargetLabel || props.openTargetLabel,
  takenMessage: props.tool?.slug?.takenMessage || props.takenMessage,
  authToken: props.tool?.authToken || props.authToken,
}))

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: resolved.value.title,
    description: resolved.value.description,
    fileLabel: resolved.value.fileLabel,
    pathLabel: resolved.value.pathLabel,
    slugPlaceholder: resolved.value.slugPlaceholder,
    previewBaseUrl: resolved.value.previewBaseUrl,
    previewPathSuffix: resolved.value.previewPathSuffix,
    createEndpoint: resolved.value.createEndpoint,
    availabilityEndpoint: resolved.value.availabilityEndpoint,
    accept: resolved.value.accept,
    uploadHint: resolved.value.uploadHint,
    ctaLabel: resolved.value.ctaLabel,
    loadingLabel: resolved.value.loadingLabel,
    openTargetLabel: resolved.value.openTargetLabel,
    takenMessage: resolved.value.takenMessage,
  })

  return `${providerBaseUrl.value}/tools/doc?${query}`
})
</script>
