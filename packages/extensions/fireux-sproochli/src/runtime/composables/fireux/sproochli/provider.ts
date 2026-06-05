export const SPROOCHLI_PROVIDER_DEV_URL = 'http://localhost:3011'
export const SPROOCHLI_PROVIDER_PROD_URL = 'https://sproochli.web.app'

export function sproochliProviderBaseUrl() {
  return import.meta.dev ? SPROOCHLI_PROVIDER_DEV_URL : SPROOCHLI_PROVIDER_PROD_URL
}

export function sproochliProviderUrl(path: string) {
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`
  return `${sproochliProviderBaseUrl()}${cleanPath}`
}
