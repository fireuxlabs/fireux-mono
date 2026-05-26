<template>
  <div class="space-y-4">
    <p class="rounded-md border border-default bg-muted/30 px-3 py-2 text-sm text-muted">
      {{ safetyCopy }}
    </p>

    <UFileUpload
      :model-value="documentFile"
      accept="application/pdf,image/*,.doc,.docx"
      :color="uploadError ? 'error' : 'primary'"
      :highlight="Boolean(uploadError)"
      :label="uploadLabel"
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
        v-if="documentSlugError"
        class="mt-1 text-xs text-error"
      >
        {{ documentSlugError }}
      </p>
      <p
        v-else-if="documentSlugTaken"
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
      @click="createGoQr"
    >
      {{ isCreating ? 'Creating...' : ctaLabel }}
    </UButton>

    <p
      v-if="createErrorMessage"
      class="text-xs text-error"
    >
      {{ createErrorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { computed, ref, watch } from 'vue'
import { useGoQrCreate } from '../composables/goQr/useGoQrCreate'

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

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024

const documentFile = ref<File | null>(null)
const documentSlug = ref('')
const uploadError = ref('')
const documentSlugError = ref('')
const documentSlugTaken = ref(false)
const isCreating = ref(false)
const createErrorMessage = ref('')
const { createDocument } = useGoQrCreate()
let availabilityTimer: ReturnType<typeof setTimeout> | undefined
let availabilityRequest = 0

const uploadDescription = computed(() => {
  return uploadError.value || `Max ${maxFileSizeMb} MB.`
})

const normalizedDocumentSlug = computed(() => normalizeSlug(documentSlug.value))

const qrPreviewUrl = computed(() => {
  const slug = normalizedDocumentSlug.value || 'my-doc'
  return `https://go-qr.web.app/${slug}/qr`
})

const canCreateQr = computed(() => {
  return Boolean(
    documentFile.value &&
    documentSlug.value.trim() &&
    !documentSlugError.value &&
    !documentSlugTaken.value &&
    !uploadError.value &&
    !isCreating.value
  )
})

watch(documentSlug, (value) => {
  if (availabilityTimer) clearTimeout(availabilityTimer)

  const id = normalizeSlug(value)
  documentSlugTaken.value = false
  documentSlugError.value = validateDocumentSlug(id)

  if (!id || documentSlugError.value) return

  availabilityTimer = setTimeout(async () => {
    const requestId = ++availabilityRequest

    try {
      const response = await $fetch<{
        taken?: boolean
        is_valid?: boolean
        message?: string
      }>('/api/docs/availability', { query: { id } })

      if (requestId === availabilityRequest) {
        documentSlugTaken.value = Boolean(response.taken)
        documentSlugError.value =
          response.is_valid === false ? response.message || 'Document path is not valid.' : ''
      }
    } catch (error) {
      if (requestId === availabilityRequest) {
        documentSlugTaken.value = false
        documentSlugError.value =
          error instanceof Error ? error.message : 'Document path is not valid.'
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

function validateDocumentSlug(value: string) {
  const result = validatePublicSlug(value, {
    label: 'Document path',
    reservedScope: 'root',
    reserved: reservedDocumentSlugs,
  })

  return result.isValid ? '' : result.message || 'Document path is not valid.'
}

async function createGoQr() {
  if (!canCreateQr.value || !documentFile.value) return

  isCreating.value = true
  createErrorMessage.value = ''

  try {
    const slug = normalizedDocumentSlug.value

    const response = await createDocument({
      file: documentFile.value,
      slug,
      type: props.type,
    })

    await navigateTo(response.path || `/${encodeURIComponent(slug)}`)
  } catch (error) {
    createErrorMessage.value =
      error instanceof Error ? error.message : 'Could not create QR doc.'
  } finally {
    isCreating.value = false
  }
}
</script>
