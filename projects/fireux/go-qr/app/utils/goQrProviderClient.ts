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
  ui: {
    title: string
    description: string
    upload_label: string
    cta_label: string
    loading_label: string
    success_title: string
    open_target_label: string
    open_qr_label: string
  }
  preview: {
    base_url: string
    path_suffix: string
  }
}

export type GoQrDocToolContract = GoQrToolBaseContract & {
  tool: GoQrToolBaseContract['tool'] & {
    accepts: string[]
    max_file_size_mb: number
  }
  ui: GoQrToolBaseContract['ui'] & {
    upload_label: string
    cta_label: string
    loading_label: string
    success_title: string
    open_target_label: string
    open_qr_label: string
  }
}

export type GoQrTextToolContract = GoQrToolBaseContract & {
  tool: GoQrToolBaseContract['tool'] & {
    max_text_length: number
  }
  ui: GoQrToolBaseContract['ui'] & {
    text_label: string
    text_placeholder: string
    cta_label: string
    loading_label: string
    open_target_label: string
    open_qr_label: string
  }
}

export type GoQrToolContract = GoQrDocToolContract
export type GoQrAnyToolContract = GoQrDocToolContract | GoQrTextToolContract

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
    publicDoc: {
      async config() {
        return await fetchProvider<GoQrDocToolContract>('/api/tools/doc')
      },
      availability(slug: string) {
        return fetchProvider('/api/tools/doc/availability', {
          query: { id: slug },
        })
      },
      create(input: { slug: string; file: File }) {
        const formData = new FormData()
        formData.append('slug', input.slug)
        formData.append('file', input.file)

        return fetchProvider('/api/tools/doc/create', {
          method: 'POST',
          body: formData,
        })
      },
    },
    resolveUrl(path: string) {
      return resolveProviderUrl(baseUrl, path)
    },
  }
}
