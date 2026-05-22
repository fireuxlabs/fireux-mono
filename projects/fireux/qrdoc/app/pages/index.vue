<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <div class="mx-auto max-w-xl space-y-4">
        <UFileUpload
          :model-value="documentFile"
          accept="application/pdf,image/*,.doc,.docx"
          :color="uploadError ? 'error' : 'primary'"
          :highlight="Boolean(uploadError)"
          label="Drop your document here"
          :description="uploadDescription"
          size="xl"
          variant="area"
          class="w-full"
          :ui="{ base: 'min-h-72' }"
          @update:model-value="setDocumentFile"
        />

        <UFormField>
          <UInput
            v-model="documentSlug"
            placeholder="my-doc"
            class="w-full"
          />
          <p class="mt-1 text-xs text-muted">
            Printable QR found at {{ qrPreviewUrl }}
          </p>
        </UFormField>

        <UCheckbox
          :model-value="processWithAi"
          label="Process with AI"
          @update:model-value="setProcessWithAi"
        />
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024

const documentFile = ref<File | null>(null)
const documentSlug = ref('')
const processWithAi = ref(false)
const uploadError = ref('')

const uploadDescription = computed(() => {
  return uploadError.value || `PDF, image, DOC or DOCX. Max ${maxFileSizeMb} MB.`
})

const qrPreviewUrl = computed(() => {
  const slug = documentSlug.value.trim() || 'my-doc'
  return `https://qrdoc.web.app/docs/${slug}/qr`
})

function setProcessWithAi(value: boolean | 'indeterminate') {
  processWithAi.value = value === true
}

function setDocumentFile(value: File | File[] | null | undefined) {
  const file = Array.isArray(value) ? value[0] || null : value || null

  if (!file) {
    uploadError.value = ''
    documentFile.value = null
    return
  }

  if (file.size > maxFileSizeBytes) {
    uploadError.value = `Max file size is ${maxFileSizeMb} MB.`
    documentFile.value = null
    return
  }

  uploadError.value = ''
  documentFile.value = file
}

useSeoMeta({
  title: 'QRdoc',
  description: 'Turn any document into a public URL and QR code.',
})
</script>
