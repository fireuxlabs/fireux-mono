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
            {{ qrPreviewUrl }}
          </p>
          <p
            v-if="documentSlugTaken"
            class="mt-1 text-xs text-error"
          >
            This document path is already taken.
          </p>
        </UFormField>

        <UButton
          icon="i-lucide-qr-code"
          block
          size="lg"
          :disabled="!canCreateQr"
          :loading="isCreating"
          @click="createQrDoc"
        >
          {{ isCreating ? 'Creating...' : 'Create QR doc' }}
        </UButton>

        <p
          v-if="createErrorMessage"
          class="text-xs text-error"
        >
          {{ createErrorMessage }}
        </p>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { navigateTo, useSeoMeta } from '#imports'
import { computed, ref, watch } from 'vue'
import { useQrdocCreate } from '../composables/qrdoc/useQrdocCreate'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024

const documentFile = ref<File | null>(null)
const documentSlug = ref('')
const uploadError = ref('')
const documentSlugTaken = ref(false)
const isCreating = ref(false)
const createErrorMessage = ref('')
const { createDocument } = useQrdocCreate()
let availabilityTimer: number | undefined
let availabilityRequest = 0

const uploadDescription = computed(() => {
  return uploadError.value || `PDF, image, DOC or DOCX. Max ${maxFileSizeMb} MB.`
})

const qrPreviewUrl = computed(() => {
  const slug = documentSlug.value.trim() || 'my-doc'
  return `https://qrdocs.web.app/docs/${slug}/qr`
})

const canCreateQr = computed(() => {
  return Boolean(
    documentFile.value &&
    documentSlug.value.trim() &&
    !documentSlugTaken.value &&
    !uploadError.value &&
    !isCreating.value
  )
})

watch(documentSlug, (value) => {
  if (availabilityTimer) window.clearTimeout(availabilityTimer)

  const id = value.trim()
  documentSlugTaken.value = false

  if (!id || id.includes('/') || id === '.' || id === '..') return

  availabilityTimer = window.setTimeout(async () => {
    const requestId = ++availabilityRequest

    try {
      const response = await $fetch<{ taken?: boolean }>('/api/docs/availability', {
        query: { id },
      })

      if (requestId === availabilityRequest) {
        documentSlugTaken.value = Boolean(response.taken)
      }
    } catch {
      if (requestId === availabilityRequest) {
        documentSlugTaken.value = false
      }
    }
  }, 250)
})

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

async function createQrDoc() {
  if (!canCreateQr.value || !documentFile.value) return

  isCreating.value = true
  createErrorMessage.value = ''

  try {
    const slug = documentSlug.value.trim()

    const response = await createDocument({
      file: documentFile.value,
      slug,
    })

    await navigateTo(response.path || `/docs/${encodeURIComponent(slug)}`)
  } catch (error) {
    createErrorMessage.value =
      error instanceof Error ? error.message : 'Could not create QR doc.'
  } finally {
    isCreating.value = false
  }
}

useSeoMeta({
  title: 'QRdocs',
  description: 'Turn any document into a public URL and QR code.',
})
</script>
