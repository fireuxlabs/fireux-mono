<template>
  <GoQrToolFileUpload
    endpoint="/api/docs/create"
    upload-type="doc"
    :upload-label="uploadLabel"
    :cta-label="ctaLabel"
    :safety-copy="safetyCopy"
    :upsell-copy="upsellCopy"
    :slug-placeholder="slugPlaceholder"
    :preview-base-url="previewBaseUrl"
    slug-label="Document path"
    slug-validation-label="Document path"
    availability-endpoint="/api/docs/availability"
    taken-message="This doc path is already taken."
    :reserved-slugs="reservedDocumentSlugs"
    navigate-on-success
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  uploadLabel?: string
  ctaLabel?: string
  safetyCopy?: string
}>(), {
  uploadLabel: 'Drop your doc here',
  ctaLabel: 'Create your first QR doc free',
  safetyCopy: 'QR docs are for public information. Anyone with the link or QR code can view your doc.',
})

const previewBaseUrl = 'https://go-qr.web.app/doc'
const slugPlaceholder = 'my-doc'
const upsellCopy = ''
const reservedDocumentSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'console',
  'dashboard',
  'docs',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]
</script>
