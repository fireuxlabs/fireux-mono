import type { SproochliLanguageCode } from '../composables/fireux/sproochli/publicLanguage'

export type SproochliSupportedLanguage = Exclude<SproochliLanguageCode, ''>
export type SproochliDefaultLanguage = SproochliSupportedLanguage | 'mixed'

export type SproochliAttachmentConfig = {
  enabled: boolean
  default_language?: SproochliDefaultLanguage
  profile_id?: string
  requested_languages: SproochliSupportedLanguage[]
}
