<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Place palette onboarding: stage optional logo and sparse shared colours. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: make optional Place branding visual and concise. -->
  <section class="form-stack-sm">
    <MoleculesFormsFirestoreImagePicker
      v-if="imageEditable"
      :src="previewSource"
      :alt="placeName || 'Place'"
      :initials="initials"
      :button-label="hasPreview ? 'Change Place image' : 'Choose Place image'"
      :loading="uploading"
      :disabled="uploading"
      :update-function="stageImage"
    />

    <UAlert
      v-else-if="imageUrl"
      color="neutral"
      variant="soft"
      icon="i-lucide-image"
      title="Current logo"
    />

    <p v-if="imageFile" class="form-text-muted">
      {{ imageFile.name }} selected
    </p>

    <UButton
      v-if="imageEditable"
      type="button"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      :label="hasPreview ? 'Remove image' : 'No logo for now'"
      :disabled="uploading"
      @click="clearImage"
    />

    <MoleculesFormsBrandPalette
      :model-value="brandPalette"
      :disabled="!paletteEditable"
      active-label="Place colour"
      inherit-label="FireUX default"
      @update:model-value="emit('update:brandPalette', $event)"
    />

    <UAlert
      v-if="!paletteEditable && Object.keys(brandPalette).length"
      color="neutral"
      variant="soft"
      icon="i-lucide-palette"
      title="Using the existing Place colours"
      description="Onboarding preserves an established Place palette."
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { SparseBrandPalette } from 'fireux-core/runtime/models/utils/style.model'

const props = defineProps<{
  placeName: string
  imageUrl: string
  imageFile: File | null
  uploading: boolean
  imageEditable: boolean
  brandPalette: SparseBrandPalette
  paletteEditable: boolean
}>()

const emit = defineEmits<{
  (event: 'image-selected', file: File | null): void
  (event: 'update:brandPalette', value: SparseBrandPalette): void
}>()

const objectUrl = ref('')
let previewedFile: File | null = null

const previewSource = computed(() => objectUrl.value || props.imageUrl)
const hasPreview = computed(() => Boolean(previewSource.value))
const initials = computed(() => {
  const parts = props.placeName.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'P'

  return parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
})

function revokeObjectUrl() {
  if (objectUrl.value && import.meta.client) {
    URL.revokeObjectURL(objectUrl.value)
  }

  objectUrl.value = ''
  previewedFile = null
}

function syncPreview(file: File | null) {
  if (previewedFile === file) return

  revokeObjectUrl()
  if (!file || !import.meta.client) return

  objectUrl.value = URL.createObjectURL(file)
  previewedFile = file
}

function stageImage(file: File) {
  if (!props.imageEditable) return
  syncPreview(file)
  emit('image-selected', file)
}

function clearImage() {
  if (!props.imageEditable) return
  revokeObjectUrl()
  emit('image-selected', null)
}

watch(
  () => props.imageFile,
  file => syncPreview(file),
  { immediate: true }
)

onBeforeUnmount(revokeObjectUrl)
</script>
