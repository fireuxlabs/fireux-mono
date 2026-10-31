<template>
  <form
    class="workspace-surface workspace-surface--compact"
    @submit.prevent="uploadFiles(files || [])"
  >
    <p v-if="description" class="fx-type-caption">{{ description }}</p>
    <UFileUpload
      v-model="selection"
      label="Choose a PDF or photos"
      description="PDF, JPG, PNG or WebP"
      accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
      :multiple="!document"
      :disabled="pending || !canWrite"
      variant="area"
    />
    <p v-if="!currencyCode" class="menu-editor-warning">
      Set the Place currency before importing a menu.
    </p>
    <p v-if="error" role="alert" class="menu-editor-error">{{ error }}</p>
    <p v-if="message" role="status" class="fx-type-caption">{{ message }}</p>
    <UButton
      type="submit"
      :label="ctaLabel || 'Upload menu'"
      icon="i-lucide-upload"
      :loading="pending"
      :disabled="pending || !canWrite || !currencyCode || !files.length"
    />
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMenuSourceUpload } from '../../../../composables/workspace/menus/useMenuSourceUpload'
const props = defineProps<{
  document?: boolean
  uploadId?: string
  replaceExisting?: boolean
  description?: string
  ctaLabel?: string
}>()
const selection = ref<File | File[] | null>(null)
const files = computed(() =>
  Array.isArray(selection.value)
    ? selection.value
    : selection.value
      ? [selection.value]
      : []
)
const { uploadFiles, pending, error, message, canWrite, currencyCode } =
  useMenuSourceUpload({
    document: () => props.document,
    uploadId: () => props.uploadId,
    replaceExisting: () => props.replaceExisting,
    ownerSources: [selection],
  })
</script>
