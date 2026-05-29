export type GoQrToolBaseContract = {
  ok: boolean
  provider: {
    id: string
    name: string
    url: string
    logo_url?: string
    app_info_url: string
    base_url: string
  }
  tool: {
    id: string
    name: string
  }
  ui: {
    title: string
    description: string
  }
}

export type GoQrSavedToolContract = GoQrToolBaseContract & {
  tool: GoQrToolBaseContract['tool'] & {
    upload_type: string
    anonymous_max_creates: number
    result: {
      target_path_pattern: string
      qr_path_pattern: string
      label: string
    }
  }
  endpoints: {
    availability: string
    create: string
    app_info: string
  }
  slug: {
    label: string
    validation_label: string
    placeholder: string
    reserved: string[]
    taken_message: string
  }
  preview: {
    base_url: string
    path_suffix: string
  }
}

export type GoQrTextToolContract = GoQrSavedToolContract & {
  tool: GoQrSavedToolContract['tool'] & {
    max_text_length: number
  }
  ui: GoQrSavedToolContract['ui'] & {
    text_label: string
    text_placeholder: string
    cta_label: string
    loading_label: string
    open_target_label: string
    open_qr_label: string
  }
}

export type GoQrDocToolContract = GoQrToolBaseContract & {
  tool: GoQrToolBaseContract['tool'] & {
    kind: 'doc'
    message: string
  }
}

export type GoQrToolContract = GoQrTextToolContract | GoQrDocToolContract
export type GoQrAnyToolContract = GoQrToolContract

export type GoQrAppInfo = {
  ok: boolean
  app: {
    app_name: string
    app_short_name: string
    media: {
      logo_url: string
      thumbnail_url: string
    }
  }
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

function resolveProviderUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  if (!normalizedBaseUrl) return path
  return new URL(path, `${normalizedBaseUrl}/`).toString()
}

export function createGoQrClient(options: { baseUrl?: string } = {}) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || '')

  async function fetchProvider<T>(path: string, options?: Parameters<typeof $fetch<T>>[1]) {
    return await $fetch<T>(resolveProviderUrl(baseUrl, path), options)
  }

  return {
    appInfo() {
      return fetchProvider<GoQrAppInfo>('/api/public/app/info')
    },
    doc: {
      contract() {
        return fetchProvider<GoQrDocToolContract>('/api/tools/doc')
      },
    },
    resolveUrl(path: string) {
      return resolveProviderUrl(baseUrl, path)
    },
  }
}
