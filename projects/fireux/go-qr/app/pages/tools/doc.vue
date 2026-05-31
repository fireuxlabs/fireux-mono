<template>
  <main class="bg-transparent text-default">
    <GoQrToolDoc
      class="mx-auto w-full max-w-xl"
      :title="config.title"
      :description="config.description"
      :file-label="config.fileLabel"
      :path-label="config.pathLabel"
      :slug-placeholder="config.slugPlaceholder"
      :preview-base-url="config.previewBaseUrl"
      :preview-path-suffix="config.previewPathSuffix"
      :accept="config.accept"
      :upload-hint="config.uploadHint"
      :cta-label="config.ctaLabel"
      :loading-label="config.loadingLabel"
      :open-target-label="config.openTargetLabel"
      :create-endpoint="config.createEndpoint"
      :availability-endpoint="config.availabilityEndpoint"
      :taken-message="config.takenMessage"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

definePageMeta({
  layout: false,
})

function queryString(key: string, fallback: string) {
  const value = route.query[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const config = computed(() => ({
  title: queryString('title', ''),
  description: queryString('description', ''),
  fileLabel: queryString('fileLabel', 'Doc file'),
  pathLabel: queryString('pathLabel', 'Doc path'),
  slugPlaceholder: queryString('slugPlaceholder', 'my-doc'),
  previewBaseUrl: queryString('previewBaseUrl', ''),
  previewPathSuffix: queryString('previewPathSuffix', ''),
  accept: queryString('accept', 'application/pdf,image/*,.doc,.docx'),
  uploadHint: queryString('uploadHint', 'PDF, image, DOC, or DOCX. Max 10 MB.'),
  ctaLabel: queryString('ctaLabel', 'Create doc QR'),
  loadingLabel: queryString('loadingLabel', 'Creating doc...'),
  openTargetLabel: queryString('openTargetLabel', 'Open doc'),
  createEndpoint: queryString('createEndpoint', ''),
  availabilityEndpoint: queryString('availabilityEndpoint', ''),
  takenMessage: queryString('takenMessage', 'This doc path is already taken.'),
}))
</script>
