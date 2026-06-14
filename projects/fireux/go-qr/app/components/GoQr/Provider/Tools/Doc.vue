<template>
  <GoQrProviderFrame
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
  </GoQrProviderFrame>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

type DocToolConfig = {
  copy?: {
    title?: string
    description?: string
    ctaLabel?: string
    loadingLabel?: string
    openTargetLabel?: string
  }
  upload?: {
    fileLabel?: string
    accept?: string
    hint?: string
  }
  slug?: {
    label?: string
    placeholder?: string
    takenMessage?: string
  }
  preview?: {
    baseUrl?: string
    pathSuffix?: string
  }
  endpoints?: {
    create?: string
    availability?: string
  }
}

const { data } = await useFetch<ToolResponse>('/api/tools/doc')

const props = withDefaults(defineProps<{
  tool?: DocToolConfig | null
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
  createEndpoint?: string
  availabilityEndpoint?: string
  takenMessage?: string
}>(), {
  tool: null,
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
  createEndpoint: '',
  availabilityEndpoint: '',
  takenMessage: 'This doc path is already taken.',
})

const selectedFile = ref<File | File[] | null>(null)
const slugInput = ref('')
const slugTaken = ref(false)
const slugError = ref('')
const isCreating = ref(false)
const createError = ref('')
const createdPath = ref('')
const createdQrPath = ref('')
const authToken = ref('')
let authRequestResolve: ((token: string) => void) | null = null

const file = computed(() =>
  Array.isArray(selectedFile.value)
    ? selectedFile.value[0] || null
    : selectedFile.value
)
const toolTitle = computed(() =>
  props.tool?.copy?.title ||
  props.title ||
  data.value?.tool.title ||
  'Doc'
)
const toolDescription = computed(() =>
  props.tool?.copy?.description ||
  props.description ||
  data.value?.tool.description ||
  ''
)
const fileLabel = computed(() =>
  props.tool?.upload?.fileLabel || props.fileLabel
)
const pathLabel = computed(() =>
  props.tool?.slug?.label || props.pathLabel
)
const slugPlaceholder = computed(() =>
  props.tool?.slug?.placeholder || props.slugPlaceholder
)
const accept = computed(() =>
  props.tool?.upload?.accept || props.accept
)
const uploadHint = computed(() =>
  props.tool?.upload?.hint || props.uploadHint
)
const ctaLabel = computed(() =>
  props.tool?.copy?.ctaLabel || props.ctaLabel
)
const loadingLabel = computed(() =>
  props.tool?.copy?.loadingLabel || props.loadingLabel
)
const openTargetLabel = computed(() =>
  props.tool?.copy?.openTargetLabel || props.openTargetLabel
)
const takenMessage = computed(() =>
  props.tool?.slug?.takenMessage || props.takenMessage
)
const normalizedSlug = computed(() =>
  slugInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
)
const previewBaseUrl = computed(() =>
  props.tool?.preview?.baseUrl ||
  props.previewBaseUrl ||
  data.value?.tool.preview?.base_url ||
  'https://go-qr.web.app/doc'
)
const previewPathSuffix = computed(() => {
  const configured = props.tool?.preview?.pathSuffix
  if (configured !== undefined) return configured

  return props.previewPathSuffix ||
    data.value?.tool.preview?.path_suffix ||
    '/qr'
})
const previewUrl = computed(() =>
  `${previewBaseUrl.value}/${normalizedSlug.value || slugPlaceholder.value}${previewPathSuffix.value}`
)
const availabilityEndpoint = computed(() =>
  props.tool?.endpoints?.availability ||
  props.availabilityEndpoint ||
  data.value?.tool.endpoints?.availability ||
  '/api/tools/doc/availability'
)
const createEndpoint = computed(() =>
  props.tool?.endpoints?.create ||
  props.createEndpoint ||
  data.value?.tool.endpoints?.create ||
  '/api/tools/doc/create'
)
const canUseSlug = computed(() =>
  Boolean(normalizedSlug.value && !slugTaken.value && !slugError.value)
)
const slugMessage = computed(() => {
  if (slugError.value) return slugError.value
  if (slugTaken.value) return takenMessage.value
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
    const token = await requestToolAuth()
    const response = await $fetch<{
      taken?: boolean
      is_valid?: boolean
      message?: string
    }>(availabilityEndpoint.value, {
      query: { id: slug },
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })

    slugTaken.value = Boolean(response.taken)
    slugError.value = response.is_valid === false ? response.message || 'Doc path is not valid.' : ''
  } catch (error) {
    slugError.value = error instanceof Error ? error.message : 'Doc path is not valid.'
  }
})

onMounted(() => {
  window.addEventListener('message', handleToolAuthMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleToolAuthMessage)
})

function handleToolAuthMessage(event: MessageEvent) {
  if (event.source !== window.parent) return
  if (event.data?.source !== 'fireux-tool-iframe') return
  if (event.data?.type !== 'tool-auth') return

  const token = typeof event.data.token === 'string' ? event.data.token : ''
  authToken.value = token
  authRequestResolve?.(token)
  authRequestResolve = null
}

function requestToolAuth() {
  if (!import.meta.client || window.parent === window) return Promise.resolve(authToken.value)
  if (authToken.value) return Promise.resolve(authToken.value)

  return new Promise<string>((resolve) => {
    authRequestResolve = resolve
    window.parent.postMessage({
      source: 'go-qr',
      tool: 'doc',
      type: 'tool-auth-request',
    }, '*')

    window.setTimeout(() => {
      if (!authRequestResolve) return
      authRequestResolve = null
      resolve(authToken.value)
    }, 700)
  })
}

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
    const token = await requestToolAuth()

    const response = await $fetch<{
      path?: string
      qr_path?: string
      url?: string
      qr_url?: string
    }>(createEndpoint.value, {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
      body: form,
    })

    createdPath.value = response.url || response.path || ''
    createdQrPath.value = response.qr_url || response.qr_path || ''
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Doc could not be created.'
  } finally {
    isCreating.value = false
  }
}
</script>
