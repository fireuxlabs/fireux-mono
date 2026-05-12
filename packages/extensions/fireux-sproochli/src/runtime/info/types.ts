export type InfoLanguageCode = string

export type InfoLanguageMode = 'original' | 'certified' | 'cached'

export type InfoDirection = 'ltr' | 'rtl'

export type LocalizedTextMap = Partial<Record<InfoLanguageCode, string>>

export type InfoBlockType = 'text' | 'warning' | 'list' | 'contact' | 'link'

export type InfoPlace = {
  id: string
  slug: string
  name: string
  primary_language: InfoLanguageCode
  supported_languages: InfoLanguageCode[]
  contact?: string
}

// Compatibility alias: Sproochli Place means InfoPlace, not fireux-places Place.
export type Place = InfoPlace

export type InfoBlock = {
  id: string
  type: InfoBlockType
  title?: string
  body: string
  titles?: LocalizedTextMap
  bodies?: LocalizedTextMap
  sort_order: number
}

export type InfoSection = {
  id: string
  title: string
  titles?: LocalizedTextMap
  description?: string
  descriptions?: LocalizedTextMap
  blocks: InfoBlock[]
  sort_order: number
}

export type InfoPage = {
  id: string
  place_id: string
  slug: string
  title: string
  description: string
  original_language: InfoLanguageCode
  titles?: LocalizedTextMap
  descriptions?: LocalizedTextMap
  sections: InfoSection[]
  active: boolean
  published: boolean
  sort_order: number
}

export type CachedInfoBlockTranslation = {
  title?: string
  body?: string
}

export type CachedInfoSectionTranslation = {
  title?: string
  description?: string
  blocks?: Record<string, CachedInfoBlockTranslation>
}

export type InfoPageTranslationCache = {
  language: InfoLanguageCode
  title?: string
  description?: string
  sections?: Record<string, CachedInfoSectionTranslation>
}

export type PublicInfoBlock = {
  id: string
  type: InfoBlockType
  title: string
  body: string
  sort_order: number
}

export type PublicInfoSection = {
  id: string
  title: string
  description: string
  blocks: PublicInfoBlock[]
  sort_order: number
}

export type PublicInfoPage = Omit<InfoPage, 'sections'> & {
  title: string
  description: string
  sections: PublicInfoSection[]
}

export type PublicInfoPageResponse = {
  place: InfoPlace
  page: PublicInfoPage
  language: InfoLanguageCode
  requested_language: string
  direction: InfoDirection
  translation_source: InfoLanguageMode
}
