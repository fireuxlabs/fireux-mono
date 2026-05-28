<template>
  <div class="space-y-4">
    <a
      v-if="poweredBy"
      :href="poweredBy.url"
      target="_blank"
      rel="noopener"
      class="ml-auto inline-flex w-fit items-center gap-3 rounded-md border border-default bg-default px-3 py-2 text-sm font-semibold text-highlighted shadow-sm transition hover:border-primary hover:text-primary"
      :aria-label="`Powered by ${poweredBy.name}`"
    >
      <img
        v-if="poweredBy.logo_url"
        :src="poweredBy.logo_url"
        :alt="poweredBy.name"
        class="size-7 rounded-md"
      >
      <span class="leading-tight">
        <span class="block text-[0.65rem] font-medium uppercase tracking-wide text-muted">
          Powered by
        </span>
        <span>{{ poweredBy.name }}</span>
      </span>
    </a>

    <form class="space-y-4" @submit.prevent="createQr">
      <p
        v-if="safetyCopy"
        class="rounded-md border border-default bg-muted/30 px-3 py-2 text-sm text-muted"
      >
        {{ safetyCopy }}
      </p>

      <p
        v-if="upsellCopy"
        class="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-highlighted"
      >
        {{ upsellCopy }}
      </p>

      <UFileUpload
        :model-value="file"
        :accept="accept"
        :color="uploadError ? 'error' : 'primary'"
        :highlight="Boolean(uploadError)"
        :label="uploadLabel"
        :description="uploadDescription"
        size="xl"
        variant="area"
        class="w-full"
        :ui="{ base: minHeightClass }"
        @update:model-value="setFile"
      />

      <UFormField :label="slugLabel">
        <UInput
          v-model="slugInput"
          :placeholder="slugPlaceholder"
          class="w-full"
        />
        <p class="mt-1 text-xs text-muted">
          {{ previewUrl }}
        </p>
        <p
          v-if="slugError"
          class="mt-1 text-xs text-error"
        >
          {{ slugError }}
        </p>
        <p
          v-else-if="slugTaken"
          class="mt-1 text-xs text-error"
        >
          {{ takenMessage }}
        </p>
      </UFormField>

      <UButton
        type="submit"
        icon="i-lucide-qr-code"
        block
        size="lg"
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

    <UCard
      v-if="!navigateOnSuccess && createdQrUrl"
      variant="subtle"
    >
      <template #header>
        <h2 class="text-lg font-semibold text-highlighted">
          {{ successTitle }}
        </h2>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="createdTargetUrl"
          :to="createdTargetUrl"
          target="_blank"
          icon="i-lucide-external-link"
        >
          {{ openTargetLabel }}
        </UButton>
        <UButton
          :to="createdQrUrl"
          target="_blank"
          icon="i-lucide-qr-code"
          variant="soft"
        >
          {{ openQrLabel }}
        </UButton>
      </div>
    </UCard>

    <DevJson
      class="mt-4"
      :data="debugPayload"
      title="QR file upload tool"
      context="Shared QR upload tool config, resolved preview paths, endpoints, and local state."
      :hide-when-empty="false"
    />
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed, onMounted, ref, watch } from 'vue'
import { normalizeSlug } from '../../utils/slug/normalizeSlug'
import { validatePublicSlug } from '../../utils/slug/validatePublicSlug'

type CreateResponse = {
  ok?: boolean
  slug?: string
  path?: string
  qr_path?: string
  url?: string
  qr_url?: string
  powered_by?: PoweredByBrand
}

type PoweredByBrand = {
  name: string
  url: string
  logo_url?: string
}

type ToolConfigResponse = {
  preview_base_url?: string
  preview_path_suffix?: string
  result_base_url?: string
  powered_by?: PoweredByBrand
}

const props = withDefaults(defineProps<{
  endpoint: string
  configEndpoint?: string
  uploadType?: string
  accept?: string
  uploadLabel?: string
  uploadDescription?: string
  ctaLabel?: string
  loadingLabel?: string
  safetyCopy?: string
  upsellCopy?: string
  slugLabel?: string
  slugPlaceholder?: string
  slugValidationLabel?: string
  previewBaseUrl?: string
  previewPathSuffix?: string
  resultBaseUrl?: string
  poweredByEndpoint?: string
  showPoweredBy?: boolean
  navigateOnSuccess?: boolean
  availabilityEndpoint?: string
  takenMessage?: string
  reservedSlugs?: string[]
  maxFileSizeMb?: number
  minHeightClass?: string
  successTitle?: string
  openTargetLabel?: string
  openQrLabel?: string
}>(), {
  configEndpoint: '',
  uploadType: '',
  accept: 'application/pdf,image/*,.doc,.docx',
  uploadLabel: 'Drop your file here',
  uploadDescription: '',
  ctaLabel: 'Create QR',
  loadingLabel: 'Creating...',
  safetyCopy: '',
  upsellCopy: '',
  slugLabel: 'Path',
  slugPlaceholder: 'my-file',
  slugValidationLabel: 'Path',
  previewBaseUrl: '',
  previewPathSuffix: '/qr',
  resultBaseUrl: '',
  poweredByEndpoint: '',
  showPoweredBy: true,
  navigateOnSuccess: false,
  availabilityEndpoint: '',
  takenMessage: 'This path is already taken.',
  reservedSlugs: () => [],
  maxFileSizeMb: 10,
  minHeightClass: 'min-h-72',
  successTitle: 'Your QR is ready',
  openTargetLabel: 'Open page',
  openQrLabel: 'Open QR page',
})

const file = ref<File | null>(null)
const slugInput = ref('')
const uploadError = ref('')
const slugError = ref('')
const slugTaken = ref(false)
const isCreating = ref(false)
const createError = ref('')
const createdTargetUrl = ref('')
const createdQrUrl = ref('')
const poweredBy = ref<PoweredByBrand | null>(null)
const configuredPreviewBaseUrl = ref('')
const configuredPreviewPathSuffix = ref('')
const configuredResultBaseUrl = ref('')
let availabilityTimer: ReturnType<typeof setTimeout> | undefined
let availabilityRequest = 0

const maxFileSizeBytes = computed(() => props.maxFileSizeMb * 1024 * 1024)
const normalizedSlug = computed(() => normalizeSlug(slugInput.value))
const effectivePreviewBaseUrl = computed(() => configuredPreviewBaseUrl.value || props.previewBaseUrl)
const effectivePreviewPathSuffix = computed(() => configuredPreviewPathSuffix.value || props.previewPathSuffix)
const effectiveResultBaseUrl = computed(() => configuredResultBaseUrl.value || props.resultBaseUrl)
const inferredConfigEndpoint = computed(() =>
  props.configEndpoint || props.endpoint.replace(/\/create$/, '/config')
)
const uploadDescription = computed(() =>
  uploadError.value || props.uploadDescription || `PDF, image, DOC, or DOCX. Max ${props.maxFileSizeMb} MB.`
)
const previewUrl = computed(() => {
  const slug = normalizedSlug.value || props.slugPlaceholder
  const base = effectivePreviewBaseUrl.value.replace(/\/+$/, '')
  return `${base ? `${base}/` : ''}${slug}${effectivePreviewPathSuffix.value}`
})
const debugPayload = computed(() => ({
  endpoints: {
    create: props.endpoint,
    config: inferredConfigEndpoint.value,
    availability: props.availabilityEndpoint || null,
    poweredBy: props.poweredByEndpoint || null,
  },
  upload: {
    type: props.uploadType || null,
    accept: props.accept,
    maxFileSizeMb: props.maxFileSizeMb,
    label: props.uploadLabel,
    description: uploadDescription.value,
  },
  slug: {
    label: props.slugLabel,
    validationLabel: props.slugValidationLabel,
    placeholder: props.slugPlaceholder,
    reserved: props.reservedSlugs,
    takenMessage: props.takenMessage,
    normalized: normalizedSlug.value || null,
    error: slugError.value || null,
    taken: slugTaken.value,
  },
  preview: {
    baseUrl: effectivePreviewBaseUrl.value || null,
    pathSuffix: effectivePreviewPathSuffix.value,
    url: previewUrl.value,
  },
  result: {
    baseUrl: effectiveResultBaseUrl.value || null,
    targetUrl: createdTargetUrl.value || null,
    qrUrl: createdQrUrl.value || null,
    navigateOnSuccess: props.navigateOnSuccess,
  },
  poweredBy: poweredBy.value,
  state: {
    hasFile: Boolean(file.value),
    uploadError: uploadError.value || null,
    canCreate: canCreate.value,
    isCreating: isCreating.value,
    createError: createError.value || null,
  },
}))
const canCreate = computed(() =>
  Boolean(
    file.value &&
      slugInput.value.trim() &&
      !uploadError.value &&
      !slugError.value &&
      !slugTaken.value &&
      !isCreating.value
  )
)

onMounted(async () => {
  if (inferredConfigEndpoint.value !== props.endpoint) {
    try {
      const response = await $fetch<ToolConfigResponse>(inferredConfigEndpoint.value)
      if (response.preview_base_url) configuredPreviewBaseUrl.value = response.preview_base_url
      if (response.preview_path_suffix) configuredPreviewPathSuffix.value = response.preview_path_suffix
      if (response.result_base_url) configuredResultBaseUrl.value = response.result_base_url
      if (props.showPoweredBy && response.powered_by?.name && response.powered_by.url) poweredBy.value = response.powered_by
    } catch {
      configuredPreviewBaseUrl.value = ''
      configuredPreviewPathSuffix.value = ''
      configuredResultBaseUrl.value = ''
    }
  }

  if (!props.poweredByEndpoint || !props.showPoweredBy) return

  try {
    const response = await $fetch<PoweredByBrand>(props.poweredByEndpoint)
    if (response?.name && response?.url) poweredBy.value = response
  } catch {
    poweredBy.value = null
  }
})

watch(slugInput, (value) => {
  if (availabilityTimer) clearTimeout(availabilityTimer)

  const slug = normalizeSlug(value)
  slugTaken.value = false
  slugError.value = validateSlug(slug)

  if (!slug || slugError.value || !props.availabilityEndpoint) return

  availabilityTimer = setTimeout(async () => {
    const requestId = ++availabilityRequest

    try {
      const response = await $fetch<{
        taken?: boolean
        is_valid?: boolean
        message?: string
      }>(props.availabilityEndpoint, { query: { id: slug } })

      if (requestId === availabilityRequest) {
        slugTaken.value = Boolean(response.taken)
        slugError.value =
          response.is_valid === false ? response.message || `${props.slugValidationLabel} is not valid.` : ''
      }
    } catch (error) {
      if (requestId === availabilityRequest) {
        slugTaken.value = false
        slugError.value = errorMessage(error, `${props.slugValidationLabel} is not valid.`)
      }
    }
  }, 250)
})

function validateSlug(value: string) {
  const result = validatePublicSlug(value, {
    label: props.slugValidationLabel,
    reservedScope: 'root',
    reserved: props.reservedSlugs,
  })

  return result.isValid ? '' : result.message || `${props.slugValidationLabel} is not valid.`
}

function setFile(value: File | File[] | null | undefined) {
  const nextFile = Array.isArray(value) ? value[0] || null : value || null

  if (!nextFile) {
    uploadError.value = ''
    file.value = null
    return
  }

  if (nextFile.size > maxFileSizeBytes.value) {
    uploadError.value = `Max file size is ${props.maxFileSizeMb} MB.`
    file.value = null
    return
  }

  uploadError.value = ''
  file.value = nextFile
}

async function createQr() {
  if (!canCreate.value || !file.value) return

  isCreating.value = true
  createError.value = ''
  createdTargetUrl.value = ''
  createdQrUrl.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('slug', normalizedSlug.value)
    if (props.uploadType) formData.append('type', props.uploadType)

    const response = await $fetch<CreateResponse>(props.endpoint, {
      method: 'POST',
      body: formData,
    })
    if (props.showPoweredBy && response.powered_by?.name && response.powered_by.url) {
      poweredBy.value = response.powered_by
    }

    const targetUrl = resolveResultUrl(response.url || response.path || '')
    const qrUrl = resolveResultUrl(response.qr_url || response.qr_path || '')

    if (props.navigateOnSuccess) {
      await navigateTo(response.path || targetUrl || `/${encodeURIComponent(normalizedSlug.value)}`)
      return
    }

    createdTargetUrl.value = targetUrl
    createdQrUrl.value = qrUrl
  } catch (error) {
    createError.value = errorMessage(error, 'Could not create QR.')
  } finally {
    isCreating.value = false
  }
}

function resolveResultUrl(value: string) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (!import.meta.client && !props.resultBaseUrl) return value

  const base = effectiveResultBaseUrl.value || window.location.origin
  return new URL(value, base).toString()
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const data = 'data' in error ? (error as { data?: { statusMessage?: string; message?: string } }).data : null
    if (data?.statusMessage) return data.statusMessage
    if (data?.message) return data.message
  }

  return error instanceof Error ? error.message : fallback
}
</script>
