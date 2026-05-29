import { navigateTo } from '#imports'
import { computed, onMounted, ref, watch } from 'vue'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  goQrErrorMessage,
  type GoQrDocCreateResponse,
  type GoQrDocToolConfigResponse,
  type GoQrPoweredByBrand,
  type GoQrToolDocProps,
} from '../../utils/goQrToolDoc'

export function useGoQrToolDoc(props: GoQrToolDocProps) {
  const file = ref<File | null>(null)
  const slugInput = ref('')
  const uploadError = ref('')
  const slugError = ref('')
  const slugTaken = ref(false)
  const isCreating = ref(false)
  const createError = ref('')
  const createdTargetUrl = ref('')
  const createdQrUrl = ref('')
  const poweredBy = ref<GoQrPoweredByBrand | null>(null)
  const configuredPreviewBaseUrl = ref('')
  const configuredPreviewPathSuffix = ref('')
  const configuredResultBaseUrl = ref('')
  let availabilityTimer: ReturnType<typeof setTimeout> | undefined
  let availabilityRequest = 0

  const toolAccept = computed(() => props.tool?.tool?.accepts?.join(',') || props.accept || '')
  const toolEndpoint = computed(() => props.tool?.endpoints?.create || props.endpoint || '')
  const toolConfigEndpoint = computed(() => props.configEndpoint || '')
  const toolUploadType = computed(() => props.tool?.tool?.upload_type || props.uploadType || '')
  const toolUploadLabel = computed(() => props.tool?.ui?.upload_label || props.uploadLabel || '')
  const toolUploadDescription = computed(() =>
    props.tool?.ui?.upload_description || props.uploadDescription || ''
  )
  const toolCtaLabel = computed(() => props.tool?.ui?.cta_label || props.ctaLabel || '')
  const toolLoadingLabel = computed(() => props.tool?.ui?.loading_label || props.loadingLabel || '')
  const toolSlugLabel = computed(() => props.tool?.slug?.label || props.slugLabel || '')
  const toolSlugPlaceholder = computed(() => props.tool?.slug?.placeholder || props.slugPlaceholder || '')
  const toolSlugValidationLabel = computed(() =>
    props.tool?.slug?.validation_label || props.slugValidationLabel || ''
  )
  const toolPreviewBaseUrl = computed(() => props.tool?.preview?.base_url || props.previewBaseUrl || '')
  const toolPreviewPathSuffix = computed(() =>
    props.tool?.preview?.path_suffix ?? props.previewPathSuffix ?? ''
  )
  const toolResultBaseUrl = computed(() =>
    props.tool?.result_base_url || props.tool?.provider?.base_url || props.resultBaseUrl || ''
  )
  const toolAvailabilityEndpoint = computed(() =>
    props.tool?.endpoints?.availability || props.availabilityEndpoint || ''
  )
  const toolTakenMessage = computed(() => props.tool?.slug?.taken_message || props.takenMessage || '')
  const toolReservedSlugs = computed(() => props.tool?.slug?.reserved || props.reservedSlugs || [])
  const toolMaxFileSizeMb = computed(() =>
    props.tool?.tool?.max_file_size_mb || props.maxFileSizeMb || 10
  )
  const toolSuccessTitle = computed(() => props.tool?.ui?.success_title || props.successTitle || '')
  const toolOpenTargetLabel = computed(() =>
    props.tool?.ui?.open_target_label || props.openTargetLabel || ''
  )
  const toolOpenQrLabel = computed(() => props.tool?.ui?.open_qr_label || props.openQrLabel || '')
  const toolPoweredBy = computed<GoQrPoweredByBrand | null>(() => {
    const provider = props.tool?.provider
    if (!provider?.name || !provider.url) return null

    return {
      name: provider.name,
      url: provider.url,
      logo_url: provider.logo_url,
    }
  })

  const maxFileSizeBytes = computed(() => toolMaxFileSizeMb.value * 1024 * 1024)
  const normalizedSlug = computed(() => normalizeSlug(slugInput.value))
  const effectivePreviewBaseUrl = computed(() => configuredPreviewBaseUrl.value || toolPreviewBaseUrl.value)
  const effectivePreviewPathSuffix = computed(() => configuredPreviewPathSuffix.value || toolPreviewPathSuffix.value)
  const effectiveResultBaseUrl = computed(() => configuredResultBaseUrl.value || toolResultBaseUrl.value)
  const inferredConfigEndpoint = computed(() =>
    toolConfigEndpoint.value || toolEndpoint.value.replace(/\/create$/, '/config')
  )
  const uploadDescription = computed(() =>
    uploadError.value ||
    toolUploadDescription.value ||
    `PDF, image, DOC, or DOCX. Max ${toolMaxFileSizeMb.value} MB.`
  )
  const previewUrl = computed(() => {
    const slug = normalizedSlug.value || toolSlugPlaceholder.value
    const base = effectivePreviewBaseUrl.value.replace(/\/+$/, '')
    return `${base ? `${base}/` : ''}${slug}${effectivePreviewPathSuffix.value}`
  })
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
  const debugPayload = computed(() => ({
    endpoints: {
      create: toolEndpoint.value,
      config: inferredConfigEndpoint.value,
      availability: toolAvailabilityEndpoint.value || null,
      poweredBy: props.poweredByEndpoint || null,
    },
    upload: {
      type: toolUploadType.value || null,
      accept: toolAccept.value,
      maxFileSizeMb: toolMaxFileSizeMb.value,
      label: toolUploadLabel.value,
      description: uploadDescription.value,
    },
    slug: {
      label: toolSlugLabel.value,
      validationLabel: toolSlugValidationLabel.value,
      placeholder: toolSlugPlaceholder.value,
      reserved: toolReservedSlugs.value,
      takenMessage: toolTakenMessage.value,
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

  onMounted(async () => {
    if (props.showPoweredBy && toolPoweredBy.value) {
      poweredBy.value = toolPoweredBy.value
    }

    if (inferredConfigEndpoint.value !== toolEndpoint.value) {
      try {
        const response = await $fetch<GoQrDocToolConfigResponse>(inferredConfigEndpoint.value)
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
      const response = await $fetch<GoQrPoweredByBrand>(props.poweredByEndpoint)
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

    if (!slug || slugError.value || !toolAvailabilityEndpoint.value) return

    availabilityTimer = setTimeout(async () => {
      const requestId = ++availabilityRequest

      try {
        const response = await $fetch<{
          taken?: boolean
          is_valid?: boolean
          message?: string
        }>(toolAvailabilityEndpoint.value, { query: { id: slug } })

        if (requestId === availabilityRequest) {
          slugTaken.value = Boolean(response.taken)
          slugError.value =
            response.is_valid === false ? response.message || `${toolSlugValidationLabel.value} is not valid.` : ''
        }
      } catch (error) {
        if (requestId === availabilityRequest) {
          slugTaken.value = false
          slugError.value = goQrErrorMessage(error, `${toolSlugValidationLabel.value} is not valid.`)
        }
      }
    }, 250)
  })

  function validateSlug(value: string) {
    const result = validatePublicSlug(value, {
      label: toolSlugValidationLabel.value,
      reservedScope: 'root',
      reserved: toolReservedSlugs.value,
    })

    return result.isValid ? '' : result.message || `${toolSlugValidationLabel.value} is not valid.`
  }

  function setFile(value: File | File[] | null | undefined) {
    const nextFile = Array.isArray(value) ? value[0] || null : value || null

    if (!nextFile) {
      uploadError.value = ''
      file.value = null
      return
    }

    if (nextFile.size > maxFileSizeBytes.value) {
      uploadError.value = `Max file size is ${toolMaxFileSizeMb.value} MB.`
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
      if (toolUploadType.value) formData.append('type', toolUploadType.value)

      const response = await $fetch<GoQrDocCreateResponse>(toolEndpoint.value, {
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
      createError.value = goQrErrorMessage(error, 'Could not create QR.')
    } finally {
      isCreating.value = false
    }
  }

  function resolveResultUrl(value: string) {
    if (!value) return ''
    if (/^https?:\/\//i.test(value)) return value
    if (!import.meta.client && !effectiveResultBaseUrl.value) return value

    const base = effectiveResultBaseUrl.value || window.location.origin
    return new URL(value, base).toString()
  }

  return {
    file,
    slugInput,
    slugError,
    slugTaken,
    uploadError,
    uploadDescription,
    previewUrl,
    poweredBy,
    createdTargetUrl,
    createdQrUrl,
    createError,
    isCreating,
    canCreate,
    debugPayload,
    setFile,
    createQr,
    toolAccept,
    toolUploadLabel,
    toolCtaLabel,
    toolLoadingLabel,
    toolSlugLabel,
    toolSlugPlaceholder,
    toolTakenMessage,
    toolSuccessTitle,
    toolOpenTargetLabel,
    toolOpenQrLabel,
  }
}
