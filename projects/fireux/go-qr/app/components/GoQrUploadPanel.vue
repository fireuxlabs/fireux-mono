<template>
  <PublicQrFileUploadTool
    endpoint="/api/docs/create"
    :upload-type="type"
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
import { computed } from 'vue'

type GoQrUploadType = 'doc' | 'food-menu'

const props = withDefaults(defineProps<{
  type?: GoQrUploadType
  uploadLabel?: string
  ctaLabel?: string
  safetyCopy?: string
}>(), {
  type: 'doc',
  uploadLabel: 'Drop your doc here',
  ctaLabel: 'Create your first QR doc free',
  safetyCopy: 'QR docs are for public information. Anyone with the link or QR code can view your doc.',
})

const previewBaseUrl = 'https://go-qr.web.app'
const slugPlaceholder = computed(() => (props.type === 'food-menu' ? 'my-restaurant-menu' : 'my-doc'))
const upsellCopy = computed(() =>
  props.type === 'food-menu'
    ? 'Your menu QR will be labelled Food Menu. Sign in later to add your restaurant logo.'
    : ''
)
const reservedDocumentSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'console',
  'dashboard',
  'docs',
  'food-menu',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]
</script>
