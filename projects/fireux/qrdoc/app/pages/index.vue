<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <header class="mx-auto mb-6 max-w-xl space-y-3">
        <h1 class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
          Upload a doc.<br />
          Get a QR code.
        </h1>
        <p class="text-base text-muted sm:text-lg">
          Turn a public doc into a shareable QR page.
        </p>
        <p class="text-sm text-muted">
          Made for information people need to scan and read.
        </p>
        <nav class="flex flex-wrap gap-3 text-sm">
          <NuxtLink to="/pricing" class="text-primary hover:underline">
            Pricing
          </NuxtLink>
          <NuxtLink to="/help" class="text-primary hover:underline">
            Help
          </NuxtLink>
          <NuxtLink to="/terms" class="text-primary hover:underline">
            Terms
          </NuxtLink>
          <NuxtLink to="/privacy" class="text-primary hover:underline">
            Privacy
          </NuxtLink>
        </nav>
      </header>

      <ClientOnly>
        <div class="mx-auto max-w-xl space-y-4">
          <p class="rounded-md border border-default bg-muted/30 px-3 py-2 text-sm text-muted">
            QRdocs are for public information. Anyone with the link or QR code can view your doc.
          </p>

          <UFileUpload
            :model-value="documentFile"
            accept="application/pdf,image/*,.doc,.docx"
            :color="uploadError ? 'error' : 'primary'"
            :highlight="Boolean(uploadError)"
            label="Drop your doc here"
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
              This doc path is already taken.
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
            {{ isCreating ? 'Creating...' : 'Create your first QRdoc free' }}
          </UButton>

          <p
            v-if="createErrorMessage"
            class="text-xs text-error"
          >
            {{ createErrorMessage }}
          </p>
        </div>
      </ClientOnly>
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
  return uploadError.value || `Max ${maxFileSizeMb} MB.`
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
  title: 'QRdocs - Upload a doc. Get a QR code.',
  ogTitle: 'QRdocs - Upload a doc. Get a QR code.',
  twitterTitle: 'QRdocs - Upload a doc. Get a QR code.',
  description: 'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
  ogDescription: 'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
  twitterDescription: 'Turn a public doc into a shareable QR page. Create your first QRdoc free.',
})
</script>
