export type MenuLanguageCode = 'de' | 'en' | 'gsw' | 'hi' | 'ar' | 'ko'

export type PublicMenuTranslation = {
  name: string
  description?: string
}

export type PublicMenuSection = {
  id: string
  order: number
  translations: Partial<Record<MenuLanguageCode, PublicMenuTranslation>>
}

export type PublicMenuItem = {
  id: string
  section_id: string
  order: number
  price_chf?: number
  image_url?: string
  is_available: boolean
  translations: Partial<Record<MenuLanguageCode, PublicMenuTranslation>>
}

export type PublicKitchenMenu = {
  id: string
  kitchen_id: string
  kitchen_slug: string
  kitchen_name: string
  kitchen_address: string
  kitchen_tagline?: string
  kitchen_phone?: string
  kitchen_instagram?: string
  opening_hours?: Partial<Record<MenuLanguageCode, string>>
  hero_image_url: string
  default_language: MenuLanguageCode
  supported_languages: MenuLanguageCode[]
  allergy_notice: Partial<Record<MenuLanguageCode, string>>
  empty_state: Partial<Record<MenuLanguageCode, PublicMenuTranslation>>
  sections: PublicMenuSection[]
  items: PublicMenuItem[]
  is_published: boolean
}

export type PublicMenuLanguage = {
  code: MenuLanguageCode
  icon: string
  label: string
  native_label: string
  short_label: string
  dir: 'ltr' | 'rtl'
}

export const publicMenuLanguages: Record<MenuLanguageCode, PublicMenuLanguage> = {
  de: {
    code: 'de',
    icon: '🇩🇪',
    label: 'Deutsch',
    native_label: 'Deutsch',
    short_label: 'DE',
    dir: 'ltr',
  },
  en: {
    code: 'en',
    icon: '🇬🇧',
    label: 'English',
    native_label: 'English',
    short_label: 'EN',
    dir: 'ltr',
  },
  gsw: {
    code: 'gsw',
    icon: '🇨🇭',
    label: 'Baernduetsch',
    native_label: 'Baernduetsch',
    short_label: 'CH',
    dir: 'ltr',
  },
  hi: {
    code: 'hi',
    icon: '🇮🇳',
    label: 'Hindi',
    native_label: 'हिन्दी',
    short_label: 'HI',
    dir: 'ltr',
  },
  ar: {
    code: 'ar',
    icon: '🇸🇦',
    label: 'Arabic',
    native_label: 'العربية',
    short_label: 'AR',
    dir: 'rtl',
  },
  ko: {
    code: 'ko',
    icon: '🇰🇷',
    label: 'Korean',
    native_label: '한국어',
    short_label: 'KO',
    dir: 'ltr',
  },
}

const allergyNotice: Record<MenuLanguageCode, string> = {
  de: 'Wenn Sie eine Allergie oder Unvertraeglichkeit haben, sprechen Sie bitte vor der Bestellung mit unserem Team.',
  en: 'If you have an allergy or intolerance, please speak to a member of staff before ordering.',
  gsw: 'Wenn du e Allergie oder Unvertraeglichkeit hesch, sprich bitte vor em Bstelle mit oisem Team.',
  hi: 'यदि आपको कोई एलर्जी या असहिष्णुता है, तो ऑर्डर करने से पहले कृपया स्टाफ से बात करें।',
  ar: 'إذا كانت لديك حساسية أو عدم تحمل لأي مكون، يرجى التحدث إلى أحد أفراد الفريق قبل الطلب.',
  ko: '알레르기나 음식 불내증이 있으시면 주문 전 직원에게 말씀해 주세요.',
}

export const publicMenus: Record<string, PublicKitchenMenu> = {
  'luna-piccante': {
    id: 'luna-piccante-main',
    kitchen_id: 'ChIJ93_ggY-jj0cRTCyLcfBuK2w',
    kitchen_slug: 'luna-piccante',
    kitchen_name: 'Luna Piccante',
    kitchen_address: 'Obereigasse 50, 3812 Wilderswil',
    kitchen_tagline: 'Italian restaurant in Wilderswil.',
    opening_hours: {
      de: 'Oeffnungszeiten folgen',
      en: 'Opening hours coming soon',
      gsw: 'Oeffnigszyte choeme glii',
      hi: 'खुलने का समय जल्द आएगा',
      ar: 'ساعات العمل قريباً',
      ko: '영업시간은 곧 안내됩니다',
    },
    hero_image_url:
      'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/places%2FChIJ93_ggY-jj0cRTCyLcfBuK2w%2Fimage?alt=media&token=e6740539-e7cb-4337-b920-6bced1bf0bfd',
    default_language: 'de',
    supported_languages: ['de', 'en', 'gsw', 'hi', 'ar', 'ko'],
    allergy_notice: allergyNotice,
    empty_state: {
      de: { name: 'Menue kommt bald', description: 'Wir bereiten das digitale Menue vor.' },
      en: { name: 'Menu coming soon', description: 'We are preparing the digital menu.' },
      gsw: { name: 'Menue chunnt glii', description: 'Mir bereite s digitale Menue vor.' },
      hi: { name: 'मेनू जल्द आ रहा है', description: 'हम डिजिटल मेनू तैयार कर रहे हैं।' },
      ar: { name: 'القائمة قريباً', description: 'نحن نجهز القائمة الرقمية.' },
      ko: { name: '메뉴 준비 중', description: '디지털 메뉴를 준비하고 있습니다.' },
    },
    is_published: true,
    sections: [],
    items: [],
  },
}

export function getPublicMenu(slug: string) {
  const normalizedSlug = String(slug || '').trim().toLowerCase()
  if (normalizedSlug === 'luna-piccante-wilderswil-switzerland') {
    return publicMenus['luna-piccante']
  }
  return publicMenus[normalizedSlug]
}
