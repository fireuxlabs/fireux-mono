export type GoQrPoweredByBrand = {
  name: string
  url: string
  logo_url?: string
}

export type GoQrDocCreateResponse = {
  ok?: boolean
  slug?: string
  path?: string
  qr_path?: string
  url?: string
  qr_url?: string
  powered_by?: GoQrPoweredByBrand
}

export type GoQrDocToolConfigResponse = {
  preview_base_url?: string
  preview_path_suffix?: string
  result_base_url?: string
  powered_by?: GoQrPoweredByBrand
}

export type GoQrDocToolContract = {
  provider?: {
    name?: string
    url?: string
    logo_url?: string
    base_url?: string
  }
  tool?: {
    upload_type?: string
    accepts?: string[]
    max_file_size_mb?: number
  }
  endpoints?: {
    create?: string
    availability?: string
  }
  slug?: {
    label?: string
    validation_label?: string
    placeholder?: string
    reserved?: string[]
    taken_message?: string
  }
  ui?: {
    upload_label?: string
    upload_description?: string
    cta_label?: string
    loading_label?: string
    success_title?: string
    open_target_label?: string
    open_qr_label?: string
  }
  preview?: {
    base_url?: string
    path_suffix?: string
  }
  result_base_url?: string
}

export type GoQrToolDocProps = {
  tool?: GoQrDocToolContract | null
  endpoint?: string
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
}

export function goQrToolDocDefaults() {
  return {
    tool: null,
    endpoint: '',
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
  }
}

export function goQrErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const data = 'data' in error ? (error as { data?: { statusMessage?: string; message?: string } }).data : null
    if (data?.statusMessage) return data.statusMessage
    if (data?.message) return data.message
  }

  return error instanceof Error ? error.message : fallback
}
