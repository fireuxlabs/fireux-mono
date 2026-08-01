import type { SproochliLanguageCode } from './publicLanguage'
import type { SproochliHostTarget } from '../../../host'

export const SPROOCHLI_PROVIDER_DEV_URL = 'http://localhost:3011'
export const SPROOCHLI_PROVIDER_PROD_URL = 'https://sproochli.web.app'

export function sproochliProviderBaseUrl() {
  return import.meta.dev
    ? SPROOCHLI_PROVIDER_DEV_URL
    : SPROOCHLI_PROVIDER_PROD_URL
}

export function sproochliProviderUrl(path: string) {
  const cleanPath = String(path || '').startsWith('/') ? path : `/${path}`
  return `${sproochliProviderBaseUrl()}${cleanPath}`
}

export type SproochliMenuTranslationField = {
  id: string
  sourceText: string
}

export type SproochliMenuSource = {
  appId: string
  kitchenId: string
  menuId: string
}

export type SproochliMenuResolveRequest = {
  host: SproochliHostTarget
  source: SproochliMenuSource
  fields: SproochliMenuTranslationField[]
  language: string
}

export type SproochliMenuResolveResponse = {
  host: SproochliHostTarget
  language: SproochliLanguageCode
  provider: string
  translations: Record<string, string>
}
