<template>
  <!-- Concurrent edit — 2026-07-21 16:26 CEST — Place onboarding enrichment: stage an optional Place image without persisting it. -->
  <section class="form-stack-sm">
    <p class="form-text-muted">
      Add a recognisable logo or image for {{ placeName }}. It stays staged
      until the Place onboarding is confirmed.
    </p>

    <MoleculesFormsFirestoreImagePicker
      :src="previewSource"
      :alt="placeName || 'Place'"
      :initials="initials"
      :button-label="hasPreview ? 'Change Place image' : 'Choose Place image'"
      :loading="uploading"
      :disabled="uploading"
      :update-function="stageImage"
    />

    <p v-if="imageFile" class="form-text-muted">
      {{ imageFile.name }} is ready for review.
    </p>

    <UButton
      type="button"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      :label="hasPreview ? 'Remove image' : 'Skip image'"
      :disabled="uploading"
      @click="clearImage"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  placeName: string
  imageUrl: string
  imageFile: File | null
  uploading: boolean
}>()

const emit = defineEmits<{
  (event: 'image-selected', file: File | null): void
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
  syncPreview(file)
  emit('image-selected', file)
}

function clearImage() {
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
