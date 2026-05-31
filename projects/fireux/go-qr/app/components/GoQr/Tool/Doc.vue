<template>
  <GoQrSystemToolFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/doc"
  >
    <form
      class="space-y-4"
      @submit.prevent="createDoc"
    >
      <UFormField :label="fileLabel">
        <UFileUpload
          v-model="selectedFile"
          :accept="accept"
          variant="area"
          size="xl"
          class="w-full"
        />
        <p class="mt-1 text-xs text-muted">
          {{ uploadHint }}
        </p>
      </UFormField>

      <UFormField :label="pathLabel">
        <UInput
          v-model="slugInput"
          :placeholder="slugPlaceholder"
          class="w-full"
        />
        <p class="mt-1 break-all text-xs text-muted">
          {{ previewUrl }}
        </p>
        <p
          v-if="slugMessage"
          class="mt-1 text-xs"
          :class="canUseSlug ? 'text-muted' : 'text-error'"
        >
          {{ slugMessage }}
        </p>
      </UFormField>

      <UButton
        type="submit"
        icon="i-lucide-qr-code"
        block
        :disabled="!canCreate"
        :loading="isCreating"
      >
        {{ isCreating ? loadingLabel : ctaLabel }}
      </UButton>

      <p
        v-if="createError"
        class="text-xs text-error"
      >
        {{ createError }}
      </p>
    </form>

    <div
      v-if="createdPath"
      class="flex flex-wrap gap-2"
    >
      <UButton
        :to="createdPath"
        target="_blank"
        icon="i-lucide-external-link"
      >
        {{ openTargetLabel }}
      </UButton>
      <UButton
        :to="createdQrPath"
        target="_blank"
        icon="i-lucide-qr-code"
        variant="soft"
      >
        Open QR
      </UButton>
    </div>
  </GoQrSystemToolFrame>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type ToolResponse = {
  tool: {
    endpoints?: {
      create: string
      availability: string
    }
    preview?: {
      base_url: string
      path_suffix: string
    }
  }
}

const { data } = await useFetch<ToolResponse>('/api/tools/doc')

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  fileLabel?: string
  pathLabel?: string
  slugPlaceholder?: string
  previewBaseUrl?: string
  previewPathSuffix?: string
  accept?: string
  uploadHint?: string
  ctaLabel?: string
  loadingLabel?: string
  openTargetLabel?: string
}>(), {
  title: '',
  description: '',
  fileLabel: 'Doc file',
  pathLabel: 'Doc path',
  slugPlaceholder: 'my-doc',
  previewBaseUrl: '',
  previewPathSuffix: '',
  accept: 'application/pdf,image/*,.doc,.docx',
  uploadHint: 'PDF, image, DOC, or DOCX. Max 10 MB.',
  ctaLabel: 'Create doc QR',
  loadingLabel: 'Creating doc...',
  openTargetLabel: 'Open doc',
})

const selectedFile = ref<File | File[] | null>(null)
const slugInput = ref('')
const slugTaken = ref(false)
const slugError = ref('')
const isCreating = ref(false)
const createError = ref('')
const createdPath = ref('')
const createdQrPath = ref('')

const file = computed(() =>
  Array.isArray(selectedFile.value)
    ? selectedFile.value[0] || null
    : selectedFile.value
)
const toolTitle = computed(() => props.title || data.value?.tool.title || 'Doc')
const toolDescription = computed(() =>
  props.description || data.value?.tool.description || ''
)
const normalizedSlug = computed(() =>
  slugInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
)
const previewBaseUrl = computed(() =>
  props.previewBaseUrl || data.value?.tool.preview?.base_url || 'https://go-qr.web.app/doc'
)
const previewPathSuffix = computed(() =>
  props.previewPathSuffix || data.value?.tool.preview?.path_suffix || '/qr'
)
const previewUrl = computed(() =>
  `${previewBaseUrl.value}/${normalizedSlug.value || props.slugPlaceholder}${previewPathSuffix.value}`
)
const availabilityEndpoint = computed(() =>
  data.value?.tool.endpoints?.availability || '/api/tools/doc/availability'
)
const createEndpoint = computed(() =>
  data.value?.tool.endpoints?.create || '/api/tools/doc/create'
)
const canUseSlug = computed(() =>
  Boolean(normalizedSlug.value && !slugTaken.value && !slugError.value)
)
const slugMessage = computed(() => {
  if (slugError.value) return slugError.value
  if (slugTaken.value) return 'This doc path is already taken.'
  return normalizedSlug.value ? 'Path is available.' : ''
})
const canCreate = computed(() =>
  Boolean(file.value && canUseSlug.value && !isCreating.value)
)

watch(slugInput, async () => {
  const slug = normalizedSlug.value
  slugTaken.value = false
  slugError.value = ''
  createdPath.value = ''
  createdQrPath.value = ''

  if (!slug) return

  try {
    const response = await $fetch<{
      taken?: boolean
      is_valid?: boolean
      message?: string
    }>(availabilityEndpoint.value, {
      query: { id: slug },
    })

    slugTaken.value = Boolean(response.taken)
    slugError.value = response.is_valid === false ? response.message || 'Doc path is not valid.' : ''
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Doc path is not valid.'
  }
})

async function createDoc() {
  if (!canCreate.value || !file.value) return

  isCreating.value = true
  createError.value = ''
  createdPath.value = ''
  createdQrPath.value = ''

  try {
    const form = new FormData()
    form.append('slug', normalizedSlug.value)
    form.append('file', file.value)

    const response = await $fetch<{
      path?: string
      qr_path?: string
    }>(createEndpoint.value, {
      method: 'POST',
      body: form,
    })

    createdPath.value = response.path || ''
    createdQrPath.value = response.qr_path || ''
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Doc could not be created.'
  } finally {
    isCreating.value = false
  }
}
</script>
